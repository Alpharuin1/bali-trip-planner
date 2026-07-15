import { useEffect, useMemo, useState } from "react";
import { Box } from "@mui/material";
import type { Day, DocBlock, PersonalDay, PersonalProfile, Plan, ThemeMode } from "../types";
import { PERSONAL_DOCS_PAGE_INDEX } from "../layout";
import { addDays, parseISO } from "../utils/date";
import { reconcilePersonalDayWithSquad } from "../utils/personalPlan";
import { DayBlock } from "./DayBlock";
import { PersonalDayBlock } from "./PersonalDayBlock";
import { PersonalDocsBlock } from "./PersonalDocsBlock";
import { DELETE_CONTROL_BLEED } from "./BlockCardShell";
import { MobileTripHeader } from "./MobileTripHeader";
import { MobileDayNav } from "./MobileDayNav";
import type { TripSnapshot } from "../services/tripCloud";

interface MobileItineraryViewProps {
  plan: Plan;
  snapshot: TripSnapshot;
  themeMode: ThemeMode;
  activeViewId: string;
  profiles: Record<string, PersonalProfile>;
  activeProfile: PersonalProfile | null;
  showPersonalPlan: boolean;
  onActiveViewChange: (viewId: string) => void;
  onUpdateDay: (id: string, day: Day) => void;
  onUpdateProfileDay: (profileId: string, dayId: string, day: PersonalDay) => void;
  onUpdateProfileDocBlocks: (profileId: string, docBlocks: DocBlock[]) => void;
  onImportSnapshot: (snapshot: TripSnapshot) => void;
}

export function MobileItineraryView({
  plan,
  snapshot,
  themeMode,
  activeViewId,
  profiles,
  activeProfile,
  showPersonalPlan,
  onActiveViewChange,
  onUpdateDay,
  onUpdateProfileDay,
  onUpdateProfileDocBlocks,
  onImportSnapshot,
}: MobileItineraryViewProps) {
  const [pageIndex, setPageIndex] = useState(
    showPersonalPlan ? PERSONAL_DOCS_PAGE_INDEX : 0
  );
  const dateBase = parseISO(plan.startDate);
  const dayCount = plan.days.length;
  const minIndex = showPersonalPlan ? PERSONAL_DOCS_PAGE_INDEX : 0;
  const safeIndex = Math.min(Math.max(pageIndex, minIndex), Math.max(dayCount - 1, 0));

  useEffect(() => {
    if (pageIndex !== safeIndex) setPageIndex(safeIndex);
  }, [pageIndex, safeIndex]);

  useEffect(() => {
    setPageIndex(showPersonalPlan ? PERSONAL_DOCS_PAGE_INDEX : 0);
  }, [showPersonalPlan, activeProfile?.id]);

  const onDocs = showPersonalPlan && pageIndex === PERSONAL_DOCS_PAGE_INDEX;
  const dayIndex = onDocs ? 0 : pageIndex;
  const squadDay = plan.days[dayIndex];
  const currentDate = addDays(dateBase, dayIndex);
  const personalDay = activeProfile?.days[dayIndex];
  const personalDayId = personalDay?.id;
  const activeProfileId = activeProfile?.id;
  const docBlocks = activeProfile?.docBlocks ?? [];

  const reconciledPersonalDay = useMemo(() => {
    if (!personalDay) return undefined;
    return reconcilePersonalDayWithSquad(personalDay, squadDay);
  }, [personalDay, squadDay]);

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        mx: 0,
        mb: 0,
      }}
    >
      <MobileTripHeader
        plan={plan}
        pageIndex={pageIndex}
        showDocs={showPersonalPlan}
        activeViewId={activeViewId}
        profiles={profiles}
        themeMode={themeMode}
        snapshot={snapshot}
        onActiveViewChange={onActiveViewChange}
        onImportSnapshot={onImportSnapshot}
      />

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          overflowX: "hidden",
          WebkitOverflowScrolling: "touch",
          pl: 1.5,
          pr: (theme) => `calc(${theme.spacing(1.5)} + ${DELETE_CONTROL_BLEED}px)`,
          py: 1.25,
        }}
      >
        {showPersonalPlan && activeProfileId && onDocs ? (
          <PersonalDocsBlock
            docBlocks={docBlocks}
            mode={themeMode}
            fill
            selected
            onChange={(next) => onUpdateProfileDocBlocks(activeProfileId, next)}
          />
        ) : showPersonalPlan && activeProfileId && reconciledPersonalDay && personalDayId ? (
          <PersonalDayBlock
            index={dayIndex}
            date={currentDate}
            day={reconciledPersonalDay}
            squadDay={squadDay}
            mode={themeMode}
            fill
            hideHeader
            selected
            onChange={(next) => onUpdateProfileDay(activeProfileId, personalDayId, next)}
          />
        ) : squadDay ? (
          <DayBlock
            index={dayIndex}
            date={currentDate}
            day={squadDay}
            mode={themeMode}
            fill
            hideHeader
            readOnly
            onChange={(next) => onUpdateDay(squadDay.id, next)}
          />
        ) : null}
      </Box>

      <MobileDayNav
        plan={plan}
        pageIndex={pageIndex}
        themeMode={themeMode}
        showDocs={showPersonalPlan}
        onPageIndexChange={setPageIndex}
        onPrevious={() =>
          setPageIndex((i) => Math.max(showPersonalPlan ? PERSONAL_DOCS_PAGE_INDEX : 0, i - 1))
        }
        onNext={() => setPageIndex((i) => Math.min(dayCount - 1, i + 1))}
      />
    </Box>
  );
}
