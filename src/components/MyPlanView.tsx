import { useMemo, useState, type Ref } from "react";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import ListAltOutlinedIcon from "@mui/icons-material/ListAltOutlined";
import type { PersonalDay, PersonalProfile, Plan, ThemeMode, TileStyle } from "../types";
import { addDays, parseISO } from "../utils/date";
import { buildPackingList } from "../utils/packingList";
import { tokens } from "../theme";
import { PersonalDayBlock } from "./PersonalDayBlock";
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
}: MyPlanViewProps) {
  const t = tokens(themeMode);
  const dateBase = parseISO(squadPlan.startDate);
  const [focusedDayIndex, setFocusedDayIndex] = useState(0);
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
                Outfits & packing — synced with squad trip dates
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
              {profile.days.map((day, i) => (
                <PersonalDayBlock
                  key={day.id}
                  index={i}
                  date={addDays(dateBase, i)}
                  day={day}
                  squadDay={squadPlan.days[i]}
                  mode={themeMode}
                  selected={focusedDayIndex === i}
                  onFocus={() => setFocusedDayIndex(i)}
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
        {focusedSquadDay && (
          <DayLocationPanel
            dayIndex={focusedDayIndex}
            date={focusedDate}
            place={focusedSquadDay.place}
            endPlace={focusedSquadDay.endPlace}
            tile={tile}
            themeMode={themeMode}
            cardRadius={RADIUS_SECTION}
          />
        )}
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
