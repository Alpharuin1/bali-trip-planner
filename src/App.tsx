import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ThemeProvider,
  CssBaseline,
  Box,
  Paper,
  Stack,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import ViewWeekIcon from "@mui/icons-material/ViewWeek";
import ViewStreamIcon from "@mui/icons-material/ViewStream";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";

import { buildTheme, tokens } from "./theme";
import { TopBar } from "./components/TopBar";
import { CloudTripBar } from "./components/CloudTripBar";
import { DayBlock } from "./components/DayBlock";
import { TripMap } from "./components/TripMap";
import { MapLegend } from "./components/MapLegend";
import { TileSwitcher } from "./components/TileSwitcher";
import { TemplateRow } from "./components/TemplateRow";
import { Splitter } from "./components/Splitter";
import { SortableItem } from "./components/SortableItem";
import { findLoc } from "./locations";
import type {
  CompareLayout,
  Day,
  Plan,
  Stop,
  ThemeMode,
  TileStyle,
  ViewMode,
} from "./types";
import { addDays, fmtDate, parseISO } from "./utils/date";
import { blankPlan, ensureIds, planLength, reconcileDays } from "./utils/plan";
import { usePersistedState } from "./utils/storage";
import { colorForTemplate } from "./utils/palette";
import { useRouteLegs } from "./hooks/useRouteLegs";
import { useCloudTrip } from "./hooks/useCloudTrip";

const DEFAULT_TEMPLATE = "Plan 1";
const RADIUS_SECTION = "16px";
const RADIUS_DAY_CARD = "12px";
const MIN_PANE_WIDTH = 320;
const DEFAULT_LEFT_FRACTION = 0.55;
const PEOPLE_COUNT = 7;
const SNAP_TARGETS = [0.4, 0.5, 0.6, 0.7];
const SNAP_THRESHOLD = 0.018; // ~1.8% of container width

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

const snapFraction = (f: number): number => {
  for (const s of SNAP_TARGETS) {
    if (Math.abs(f - s) < SNAP_THRESHOLD) return s;
  }
  return f;
};

export default function App() {
  // -------- Persisted state --------
  const [themeMode, setThemeMode] = usePersistedState<ThemeMode>(
    "btp.theme",
    "light"
  );
  const [mode, setMode] = usePersistedState<ViewMode>("btp.mode", "plan");
  const [compareLayout, setCompareLayout] =
    usePersistedState<CompareLayout>("btp.cmpLayout", "stacked");
  const [tile, setTile] = usePersistedState<TileStyle>("btp.tile", "osm");
  const [leftFraction, setLeftFraction] = usePersistedState<number>(
    "btp.split",
    DEFAULT_LEFT_FRACTION
  );
  const [activeTemplate, setActiveTemplate] = usePersistedState<string>(
    "btp.activeTpl",
    DEFAULT_TEMPLATE
  );
  const [plansRaw, setPlansRaw] = usePersistedState<Record<string, Plan>>(
    "btp.plans",
    { [DEFAULT_TEMPLATE]: blankPlan(5) }
  );
  const [planOrder, setPlanOrder] = usePersistedState<string[]>(
    "btp.planOrder",
    [DEFAULT_TEMPLATE]
  );

  // Heal hydrated plans (older snapshots may lack ids / be in old shape).
  const plans = useMemo(() => {
    const out: Record<string, Plan> = {};
    for (const k of Object.keys(plansRaw)) out[k] = ensureIds(plansRaw[k]);
    return out;
  }, [plansRaw]);

  // Make sure activeTemplate stays valid even if it was deleted in a prior session.
  useEffect(() => {
    if (!plans[activeTemplate]) {
      const first = planOrder.find((n) => plans[n]) ?? Object.keys(plans)[0];
      if (first) setActiveTemplate(first);
    }
  }, [plans, planOrder, activeTemplate, setActiveTemplate]);

  const active = plans[activeTemplate] ?? Object.values(plans)[0];
  const activeColor = colorForTemplate(activeTemplate, planOrder);
  const t = tokens(themeMode);
  const theme = useMemo(() => buildTheme(themeMode), [themeMode]);

  const totalAccommodation = useMemo(() => {
    return (active?.days ?? []).reduce((sum, d) => {
      const v = d.accommodationPrice;
      return sum + (typeof v === "number" && Number.isFinite(v) ? v : 0);
    }, 0);
  }, [active]);

  const cloudSnapshot = useMemo(
    () => ({ plans, planOrder, activeTemplate }),
    [plans, planOrder, activeTemplate]
  );

  const applyCloudSnapshot = useCallback(
    (snapshot: typeof cloudSnapshot) => {
      setPlansRaw(snapshot.plans);
      setPlanOrder(snapshot.planOrder);
      setActiveTemplate(snapshot.activeTemplate);
    },
    [setPlansRaw, setPlanOrder, setActiveTemplate]
  );

  const cloud = useCloudTrip({
    snapshot: cloudSnapshot,
    applySnapshot: applyCloudSnapshot,
    tripTitle: "Bali Trip",
  });

  // -------- Plan-level mutations --------
  const setPlans = setPlansRaw;
  const updatePlan = (name: string, patch: Partial<Plan>) =>
    setPlans((prev) => ({ ...prev, [name]: { ...prev[name], ...patch } }));

  const setActiveStartDate = (v: string) => {
    setPlans((prev) => {
      const p = prev[activeTemplate];
      const newEnd = parseISO(v) > parseISO(p.endDate) ? v : p.endDate;
      const updated: Plan = { ...p, startDate: v, endDate: newEnd };
      updated.days = reconcileDays(p.days, planLength(updated));
      return { ...prev, [activeTemplate]: updated };
    });
  };

  const setActiveEndDate = (v: string) => {
    setPlans((prev) => {
      const p = prev[activeTemplate];
      if (parseISO(v) < parseISO(p.startDate)) return prev;
      const updated: Plan = { ...p, endDate: v };
      updated.days = reconcileDays(p.days, planLength(updated));
      return { ...prev, [activeTemplate]: updated };
    });
  };

  const updateDayInPlan = (planName: string, id: string, day: Day) =>
    updatePlan(planName, {
      days: plans[planName].days.map((d) => (d.id === id ? day : d)),
    });

  const reorderDaysInPlan = (planName: string, fromId: string, toId: string) => {
    const days = plans[planName].days;
    const oldIdx = days.findIndex((d) => d.id === fromId);
    const newIdx = days.findIndex((d) => d.id === toId);
    if (oldIdx < 0 || newIdx < 0) return;
    updatePlan(planName, { days: arrayMove(days, oldIdx, newIdx) });
  };

  // -------- Template management --------
  const nextFreeName = (base = "Plan") => {
    let n = planOrder.length + 1;
    while (plans[`${base} ${n}`]) n++;
    return `${base} ${n}`;
  };

  const addTemplate = () => {
    const name = nextFreeName();
    setPlans((prev) => ({ ...prev, [name]: blankPlan(5) }));
    setPlanOrder((prev) => [...prev, name]);
    setActiveTemplate(name);
  };

  const duplicateTemplate = () => {
    const baseName = `${activeTemplate} copy`;
    let candidate = baseName;
    let n = 2;
    while (plans[candidate]) {
      candidate = `${baseName} ${n++}`;
    }
    // Deep clone via JSON to ensure fresh ids on the copy.
    const cloneRaw: Plan = JSON.parse(JSON.stringify(active));
    cloneRaw.days = cloneRaw.days.map((d) => ({
      ...d,
      id: `day_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
      activityBlocks: d.activityBlocks.map((b) => ({
        ...b,
        id: `blk_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
      })),
    }));
    setPlans((prev) => ({ ...prev, [candidate]: cloneRaw }));
    setPlanOrder((prev) => [...prev, candidate]);
    setActiveTemplate(candidate);
  };

  const renameTemplate = (next: string) => {
    if (!next || next === activeTemplate || plans[next]) return;
    const oldName = activeTemplate;
    setPlans((prev) => {
      const out: Record<string, Plan> = {};
      for (const k of Object.keys(prev)) {
        out[k === oldName ? next : k] = prev[k];
      }
      return out;
    });
    setPlanOrder((prev) => prev.map((n) => (n === oldName ? next : n)));
    setActiveTemplate(next);
  };

  const deleteTemplate = () => {
    if (planOrder.length <= 1) return;
    const target = activeTemplate;
    setPlans((prev) => {
      const out = { ...prev };
      delete out[target];
      return out;
    });
    setPlanOrder((prev) => {
      const remaining = prev.filter((n) => n !== target);
      const fallback = remaining[0];
      if (fallback) setActiveTemplate(fallback);
      return remaining;
    });
  };

  // -------- Splitter handlers --------
  const containerRef = useRef<HTMLDivElement | null>(null);
  const handleSplitterDrag = (deltaX: number) => {
    const w = containerRef.current?.getBoundingClientRect().width;
    if (!w) return;
    const usable = w - 16;
    const minFrac = MIN_PANE_WIDTH / usable;
    const maxFrac = 1 - minFrac;
    setLeftFraction((prev) => {
      const next = clamp(prev + deltaX / usable, minFrac, maxFrac);
      return snapFraction(next);
    });
  };
  const resetSplit = () => setLeftFraction(DEFAULT_LEFT_FRACTION);

  // -------- Map stops + hover-link + OSRM --------
  const [hoveredDayIndex, setHoveredDayIndex] = useState<number | null>(null);
  const dayCardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const stops: Stop[] = useMemo(() => {
    if (!active) return [];
    const out: Stop[] = [];
    let counter = 1;
    active.days.forEach((d, i) => {
      const place = findLoc(d.place);
      if (place) {
        out.push({
          kind: "place",
          label: String(counter++),
          name: `Day ${i + 1} – ${place.name}`,
          coords: place.coords,
          dayIndex: i,
        });
      }
      const ender = findLoc(d.endPlace);
      if (ender && (!place || ender.name !== place.name)) {
        out.push({
          kind: "end",
          label: String(counter++),
          name: `Day ${i + 1} ends at ${ender.name}`,
          coords: ender.coords,
          dayIndex: i,
        });
      }
    });
    return out;
  }, [active]);

  const legs = useRouteLegs(stops);

  const handleMarkerClick = (dayIndex: number) => {
    const d = active.days[dayIndex];
    if (!d) return;
    const el = dayCardRefs.current[d.id];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      setHoveredDayIndex(dayIndex);
      window.setTimeout(() => setHoveredDayIndex(null), 1500);
    }
  };

  // -------- Export / Import --------
  const onExport = () => {
    const payload = { name: activeTemplate, plan: active, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeTemplate.replace(/\s+/g, "-").toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const onImport = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const plan: Plan = ensureIds(parsed.plan ?? parsed);
      const baseName = (parsed.name ?? file.name.replace(/\.json$/i, "")) as string;
      let candidate = baseName;
      let n = 2;
      while (plans[candidate]) {
        candidate = `${baseName} ${n++}`;
      }
      setPlans((prev) => ({ ...prev, [candidate]: plan }));
      setPlanOrder((prev) => [...prev, candidate]);
      setActiveTemplate(candidate);
    } catch (e) {
      console.error("Import failed", e);
      alert("Sorry — that file doesn't look like a valid trip plan JSON.");
    }
  };

  // -------- Render --------
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          p: { xs: 1.5, md: 2.5 },
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          bgcolor: "background.default",
        }}
      >
        <CloudTripBar
          configured={cloud.configured}
          shareCode={cloud.shareCode}
          syncStatus={cloud.syncStatus}
          error={cloud.error}
          themeMode={themeMode}
          onCreateSharedTrip={cloud.createSharedTrip}
          onCopyShareLink={cloud.copyShareLink}
          onStopSharing={cloud.stopSharing}
        />

        <TopBar
          country="Bali"
          startDate={active.startDate}
          endDate={active.endDate}
          templates={planOrder}
          activeTemplate={activeTemplate}
          mode={mode}
          themeMode={themeMode}
          totalAccommodation={totalAccommodation}
          peopleCount={PEOPLE_COUNT}
          onStartDateChange={setActiveStartDate}
          onEndDateChange={setActiveEndDate}
          onActiveTemplateChange={setActiveTemplate}
          onAddTemplate={addTemplate}
          onDuplicateTemplate={duplicateTemplate}
          onRenameTemplate={renameTemplate}
          onDeleteTemplate={deleteTemplate}
          onModeChange={setMode}
          onThemeModeChange={setThemeMode}
          onExport={onExport}
          onImport={onImport}
        />

        {mode === "plan" ? (
          <PlanView
            ref={containerRef}
            templateName={activeTemplate}
            plan={active}
            color={activeColor}
            tile={tile}
            stops={stops}
            legs={legs}
            themeMode={themeMode}
            hoveredDayIndex={hoveredDayIndex}
            onHoverDayIndex={setHoveredDayIndex}
            onMarkerClick={handleMarkerClick}
            onTileChange={setTile}
            leftFraction={leftFraction}
            onSplitterDrag={handleSplitterDrag}
            onResetSplit={resetSplit}
            onUpdateDay={(id, d) => updateDayInPlan(activeTemplate, id, d)}
            onReorderDays={(fromId, toId) =>
              reorderDaysInPlan(activeTemplate, fromId, toId)
            }
            registerDayRef={(id, el) => {
              dayCardRefs.current[id] = el;
            }}
          />
        ) : (
          <CompareView
            planOrder={planOrder}
            plans={plans}
            activeTemplate={activeTemplate}
            themeMode={themeMode}
            layout={compareLayout}
            onLayoutChange={setCompareLayout}
            onUpdatePlan={updatePlan}
            onActivateTemplate={setActiveTemplate}
            sectionRadius={RADIUS_SECTION}
            tokensVal={t}
          />
        )}
      </Box>
    </ThemeProvider>
  );
}

// =====================================================================
// Plan-mode (resizable split: editable cards | map)
// =====================================================================

interface PlanViewProps {
  templateName: string;
  plan: Plan;
  color: string;
  tile: TileStyle;
  stops: Stop[];
  legs: ReturnType<typeof useRouteLegs>;
  themeMode: ThemeMode;
  hoveredDayIndex: number | null;
  leftFraction: number;
  onHoverDayIndex: (i: number | null) => void;
  onMarkerClick: (dayIndex: number) => void;
  onTileChange: (s: TileStyle) => void;
  onSplitterDrag: (dx: number) => void;
  onResetSplit: () => void;
  onUpdateDay: (id: string, day: Day) => void;
  onReorderDays: (fromId: string, toId: string) => void;
  registerDayRef: (id: string, el: HTMLDivElement | null) => void;
}

const PlanView = ({
  ref,
  templateName,
  plan,
  color,
  tile,
  stops,
  legs,
  themeMode,
  hoveredDayIndex,
  leftFraction,
  onHoverDayIndex,
  onMarkerClick,
  onTileChange,
  onSplitterDrag,
  onResetSplit,
  onUpdateDay,
  onReorderDays,
  registerDayRef,
}: PlanViewProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const t = tokens(themeMode);
  const dateBase = parseISO(plan.startDate);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );
  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    onReorderDays(active.id as string, over.id as string);
  };

  return (
    <Box
      ref={ref}
      sx={{
        flex: 1,
        minHeight: 0,
        display: "flex",
      }}
    >
      <Box
        sx={{
          flex: leftFraction,
          minWidth: MIN_PANE_WIDTH,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            flex: 1,
            p: 2,
            borderRadius: RADIUS_SECTION,
            boxShadow: t.cardShadow,
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            minWidth: 0,
          }}
        >
          <Stack
            direction="row"
            sx={{
              mb: 1.5,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  bgcolor: color,
                  border: "2px solid #fff",
                  boxShadow: `0 2px 6px ${color}66`,
                }}
              />
              <Typography variant="h6">Bali itinerary · {templateName}</Typography>
            </Stack>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {plan.days.length} day{plan.days.length > 1 ? "s" : ""} ·{" "}
              {fmtDate(parseISO(plan.startDate))} →{" "}
              {fmtDate(parseISO(plan.endDate))}
            </Typography>
          </Stack>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
            <SortableContext
              items={plan.days.map((d) => d.id)}
              strategy={horizontalListSortingStrategy}
            >
              <Box
                sx={{
                  display: "flex",
                  gap: 1.5,
                  overflowX: "auto",
                  overflowY: "hidden",
                  pb: 1,
                  flex: 1,
                  alignItems: "stretch",
                  minWidth: 0,
                }}
              >
                {plan.days.map((day, i) => (
                  <SortableItem key={day.id} id={day.id} fill>
                    {(handle) => (
                      <Box
                        ref={(el: HTMLDivElement | null) =>
                          registerDayRef(day.id, el)
                        }
                        sx={{ height: "100%" }}
                      >
                        <DayBlock
                          index={i}
                          date={addDays(dateBase, i)}
                          day={day}
                          mode={themeMode}
                          cardRadius={RADIUS_DAY_CARD}
                          dragHandle={handle}
                          onHover={(h) => onHoverDayIndex(h ? i : null)}
                          onChange={(d) => onUpdateDay(day.id, d)}
                        />
                      </Box>
                    )}
                  </SortableItem>
                ))}
              </Box>
            </SortableContext>
          </DndContext>
        </Paper>
      </Box>

      <Splitter onDrag={onSplitterDrag} onDoubleClick={onResetSplit} />

      <Box
        sx={{
          flex: 1 - leftFraction,
          minWidth: MIN_PANE_WIDTH,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            flex: 1,
            p: 0,
            borderRadius: RADIUS_SECTION,
            boxShadow: t.cardShadow,
            overflow: "hidden",
            minHeight: 0,
            minWidth: 0,
            position: "relative",
          }}
        >
          <TripMap
            stops={stops}
            color={color}
            tile={tile}
            legs={legs}
            hoveredDayIndex={hoveredDayIndex}
            onMarkerClick={onMarkerClick}
          />
          <MapLegend color={color} />
          <TileSwitcher value={tile} onChange={onTileChange} />
        </Paper>
      </Box>
    </Box>
  );
};

// =====================================================================
// Compare-mode (templates stacked OR side-by-side)
// =====================================================================

interface CompareViewProps {
  planOrder: string[];
  plans: Record<string, Plan>;
  activeTemplate: string;
  themeMode: ThemeMode;
  layout: CompareLayout;
  onLayoutChange: (l: CompareLayout) => void;
  onUpdatePlan: (name: string, patch: Partial<Plan>) => void;
  onActivateTemplate: (name: string) => void;
  sectionRadius: string;
  tokensVal: ReturnType<typeof tokens>;
}

function CompareView({
  planOrder,
  plans,
  activeTemplate,
  themeMode,
  layout,
  onLayoutChange,
  onUpdatePlan,
  onActivateTemplate,
  sectionRadius,
  tokensVal: t,
}: CompareViewProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: sectionRadius,
        boxShadow: t.cardShadow,
        flex: 1,
        minHeight: 0,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Stack
        direction="row"
        sx={{
          mb: 2,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="h6">Compare templates</Typography>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={layout}
          onChange={(_, v: CompareLayout | null) => v && onLayoutChange(v)}
          sx={{
            "& .MuiToggleButton-root": {
              textTransform: "none",
              fontSize: 12,
              px: 1.25,
              py: 0.5,
              borderColor: t.innerBorder,
              color: "text.secondary",
              "&.Mui-selected": {
                bgcolor: "primary.main",
                color: "#fff",
                "&:hover": { bgcolor: "primary.dark" },
              },
            },
          }}
        >
          <ToggleButton value="stacked">
            <ViewStreamIcon sx={{ fontSize: 16, mr: 0.5 }} />
            Stacked
          </ToggleButton>
          <ToggleButton value="side-by-side">
            <ViewWeekIcon sx={{ fontSize: 16, mr: 0.5 }} />
            Side by side
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: layout === "side-by-side" ? "row" : "column",
          gap: layout === "side-by-side" ? 2 : 0,
          overflow: layout === "side-by-side" ? "auto" : "auto",
        }}
      >
        {planOrder.map((name) => (
          <TemplateRow
            key={name}
            name={name}
            plan={plans[name]}
            active={name === activeTemplate}
            cardRadius={RADIUS_DAY_CARD}
            color={colorForTemplate(name, planOrder)}
            mode={themeMode}
            layout={layout === "side-by-side" ? "column" : "row"}
            onChange={(p) => onUpdatePlan(name, p)}
            onActivate={() => onActivateTemplate(name)}
          />
        ))}
      </Box>
    </Paper>
  );
}
