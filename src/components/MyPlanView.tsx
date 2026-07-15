import { useMemo, useState, type Ref } from "react";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import ListAltOutlinedIcon from "@mui/icons-material/ListAltOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import type { DocBlock, PersonalDay, PersonalProfile, Plan, ThemeMode, TileStyle } from "../types";
import { addDays, parseISO } from "../utils/date";
import { buildPackingList } from "../utils/packingList";
import { PERSONAL_DOCS_PAGE_INDEX } from "../layout";
import { tokens } from "../theme";
import { PersonalDayBlock } from "./PersonalDayBlock";
import { PersonalDocsBlock } from "./PersonalDocsBlock";
import { DayLocationPanel } from "./DayLocationPanel";
import { PackingListDialog } from "./PackingListDialog";
import { Splitter } from "./Splitter";

const MIN_ITINERARY_WIDTH = 360;
const MIN_MAP_WIDTH = 200;
const RADIUS_SECTION = "16px";

interface MyPlanViewProps {
  profile: PersonalProfile;
  squadPlan: Plan;
  themeMode: ThemeMode;
  tile: TileStyle;
  leftFraction: number;
  splitContainerRef?: Ref<HTMLDivElement>;
  onSplitterDrag: (deltaX: number) => void;
  onResetSplit: () => void;
  onUpdateProfile: (profile: PersonalProfile) => void;
  onUpdateProfileDocBlocks: (profileId: string, docBlocks: DocBlock[]) => void;
}

export function MyPlanView({
  profile,
  squadPlan,
  themeMode,
  tile,
  leftFraction,
  splitContainerRef,
  onSplitterDrag,
  onResetSplit,
  onUpdateProfile,
  onUpdateProfileDocBlocks,
}: MyPlanViewProps) {
  const t = tokens(themeMode);
  const dateBase = parseISO(squadPlan.startDate);
  const [focusedPageIndex, setFocusedPageIndex] = useState(PERSONAL_DOCS_PAGE_INDEX);
  const [packingOpen, setPackingOpen] = useState(false);

  const packingDocument = useMemo(
    () => buildPackingList(profile, squadPlan),
    [profile, squadPlan]
  );

  const updateDay = (dayId: string, next: PersonalDay) =>
    onUpdateProfile({
      ...profile,
      days: profile.days.map((d) => (d.id === dayId ? next : d)),
    });

  const docBlocks = profile.docBlocks ?? [];
  const onDocs = focusedPageIndex === PERSONAL_DOCS_PAGE_INDEX;
  const focusedDayIndex = onDocs ? 0 : focusedPageIndex;
  const focusedSquadDay = squadPlan.days[focusedDayIndex];
  const focusedDate = addDays(dateBase, focusedDayIndex);

  return (
    <Box
      ref={splitContainerRef}
      sx={{
        flex: 1,
        minHeight: 0,
        display: "flex",
      }}
    >
      <Box
        sx={{
          flex: leftFraction,
          minWidth: MIN_ITINERARY_WIDTH,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            flex: 1,
            minHeight: 0,
            p: 2,
            borderRadius: RADIUS_SECTION,
            boxShadow: t.cardShadow,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Stack
            direction="row"
            sx={{
              flexShrink: 0,
              pb: 1.25,
              mb: 1,
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 1,
            }}
          >
            <Box>
              <Typography variant="h6">{profile.name}&apos;s plan</Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.25 }}>
                Docs, outfits & packing — synced with squad trip dates
              </Typography>
            </Box>
            <Button
              size="small"
              variant="outlined"
              startIcon={<ListAltOutlinedIcon />}
              onClick={() => setPackingOpen(true)}
              sx={{ flexShrink: 0, whiteSpace: "nowrap" }}
            >
              Export packing list
            </Button>
          </Stack>

          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
            }}
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
                minHeight: 0,
                scrollbarGutter: "stable",
              }}
            >
              <PersonalDocsBlock
                docBlocks={docBlocks}
                mode={themeMode}
                selected={onDocs}
                onFocus={() => setFocusedPageIndex(PERSONAL_DOCS_PAGE_INDEX)}
                onChange={(next) => onUpdateProfileDocBlocks(profile.id, next)}
              />
              {profile.days.map((day, i) => (
                <PersonalDayBlock
                  key={day.id}
                  index={i}
                  date={addDays(dateBase, i)}
                  day={day}
                  squadDay={squadPlan.days[i]}
                  mode={themeMode}
                  selected={focusedPageIndex === i}
                  onFocus={() => setFocusedPageIndex(i)}
                  onChange={(next) => updateDay(day.id, next)}
                />
              ))}
            </Box>
          </Box>
        </Paper>
      </Box>

      <Splitter onDrag={onSplitterDrag} onDoubleClick={onResetSplit} />

      <Box
        sx={{
          flex: 1 - leftFraction,
          minWidth: MIN_MAP_WIDTH,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {onDocs ? (
          <Paper
            elevation={0}
            sx={{
              flex: 1,
              p: 2,
              borderRadius: RADIUS_SECTION,
              boxShadow: t.cardShadow,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
              gap: 1,
            }}
          >
            <DescriptionOutlinedIcon sx={{ fontSize: 40, color: "text.secondary", opacity: 0.5 }} />
            <Typography variant="h6">Trip documents</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 280 }}>
              Store passports, insurance, tickets, and other files in labeled blocks on the Docs
              card.
            </Typography>
          </Paper>
        ) : focusedSquadDay ? (
          <DayLocationPanel
            dayIndex={focusedDayIndex}
            date={focusedDate}
            place={focusedSquadDay.place}
            endPlace={focusedSquadDay.endPlace}
            tile={tile}
            themeMode={themeMode}
            cardRadius={RADIUS_SECTION}
          />
        ) : null}
      </Box>

      <PackingListDialog
        open={packingOpen}
        profileId={profile.id}
        document={packingDocument}
        themeMode={themeMode}
        onClose={() => setPackingOpen(false)}
      />
    </Box>
  );
}
