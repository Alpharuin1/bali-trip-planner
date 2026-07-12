import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import type { Day, PersonalDay, PersonalProfile, Plan, ThemeMode } from "../types";
import { addDays, parseISO } from "../utils/date";
import { reconcilePersonalDayWithSquad } from "../utils/personalPlan";
import { DayBlock } from "./DayBlock";
import { PersonalDayBlock } from "./PersonalDayBlock";
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
  onUpdateProfile: (profile: PersonalProfile) => void;
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
  onUpdateProfile,
  onImportSnapshot,
}: MobileItineraryViewProps) {
  const [dayIndex, setDayIndex] = useState(0);
  const dateBase = parseISO(plan.startDate);
  const dayCount = plan.days.length;
  const safeIndex = Math.min(Math.max(dayIndex, 0), Math.max(dayCount - 1, 0));

  useEffect(() => {
    if (dayIndex !== safeIndex) setDayIndex(safeIndex);
  }, [dayIndex, safeIndex]);

  const squadDay = plan.days[safeIndex];
  const currentDate = addDays(dateBase, safeIndex);

  const updatePersonalDay = (dayId: string, next: PersonalDay) => {
    if (!activeProfile) return;
    onUpdateProfile({
      ...activeProfile,
      days: activeProfile.days.map((d) => (d.id === dayId ? next : d)),
    });
  };

  const personalDay = activeProfile?.days[safeIndex];

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
        dayIndex={safeIndex}
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
        {showPersonalPlan && activeProfile && personalDay ? (
          <PersonalDayBlock
            index={safeIndex}
            date={currentDate}
            day={reconcilePersonalDayWithSquad(personalDay, squadDay)}
            squadDay={squadDay}
            mode={themeMode}
            fill
            hideHeader
            selected
            onChange={(next) => updatePersonalDay(personalDay.id, next)}
          />
        ) : squadDay ? (
          <DayBlock
            index={safeIndex}
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
        dayIndex={safeIndex}
        themeMode={themeMode}
        onDayIndexChange={setDayIndex}
        onPrevious={() => setDayIndex((i) => Math.max(0, i - 1))}
        onNext={() => setDayIndex((i) => Math.min(dayCount - 1, i + 1))}
      />
    </Box>
  );
}
