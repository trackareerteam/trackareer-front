'use client';

import ChevronLeftIcon from '@/public/svg/ChevronLeft.svg';
import ChevronRightIcon from '@/public/svg/ChevronRight.svg';
import { stageScheduleApi } from '@/src/api/stageSchedule';
import { todoApi } from '@/src/api/todo';
import { CalendarCell } from '@/src/components/calendar/CalendarCell';
import { useScheduleStore } from '@/src/stores/scheduleStore';
import { useTodoStore } from '@/src/stores/todoStore';
import { ParsedStageSchedule, SCHEDULE_TYPE } from '@/src/types/stageSchedule';
import { TodoType } from '@/src/types/todo';
import {
  dateToYYYYMMDD,
  toUtcZEndOfDayFromDate,
  toUtcZStartOfDayFromDate,
} from '@/src/utils/dateFormatters';
import { addDays, format, getWeekOfMonth, startOfDay, startOfWeek } from 'date-fns';
import { useEffect, useMemo, useRef, useState } from 'react';

function sortSchedule(a: ParsedStageSchedule, b: ParsedStageSchedule) {
  const kindOrder = (item: ParsedStageSchedule) =>
    item.type === SCHEDULE_TYPE.ANNOUNCEMENT ? 0 : 1;

  const k = kindOrder(a) - kindOrder(b);
  if (k !== 0) return k;

  return a.stageName.localeCompare(b.stageName);
}

function sortTodo(a: TodoType, b: TodoType) {
  const typeOrder = (t: TodoType['isDone']) => (t ? 1 : 0);
  const t = typeOrder(a.isDone) - typeOrder(b.isDone);
  if (t !== 0) return t;
  return a.content.localeCompare(b.content);
}

type Range = { start: Date; end: Date };

export default function CalendarView() {
  // Duration
  const today = useMemo(() => startOfDay(new Date()), []);
  const [anchorDate, setAnchorDate] = useState<Date>(today);

  const weekStart = useMemo(() => startOfWeek(anchorDate, { weekStartsOn: 1 }), [anchorDate]);

  const weekLabel = useMemo(() => {
    return `${format(weekStart, 'M')}월 ${getWeekOfMonth(weekStart)}주차`;
  }, [weekStart]);

  const days14 = useMemo(
    () => Array.from({ length: 14 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  const week1 = days14.slice(0, 7);
  const week2 = days14.slice(7, 14);
  const loadedRange = useMemo<Range>(() => {
    return {
      start: days14[0],
      end: days14[13],
    };
  }, [days14]);

  const startIso = useMemo(() => toUtcZStartOfDayFromDate(loadedRange.start), [loadedRange.start]);
  const endIso = useMemo(() => toUtcZEndOfDayFromDate(loadedRange.end), [loadedRange.end]);

  const prevWeek = () => {
    setAnchorDate(d => addDays(d, -7));
  };

  const nextWeek = () => {
    setAnchorDate(d => addDays(d, +7));
  };

  const goToday = () => setAnchorDate(today);

  // Data

  const { scheduleItems, hydrateScheduleItems } = useScheduleStore();
  const hydrateScheduleItemsRef = useRef(hydrateScheduleItems);
  const { todoItems, hydrateTodoItems } = useTodoStore();
  const hydrateTodoItemsRef = useRef(hydrateTodoItems);

  useEffect(() => {
    const fetchSchedules = async () => {
      const list = await stageScheduleApi.getList({ startDate: startIso, endDate: endIso });
      const scheduledList = [];
      for (const item of list) {
        const eventAt = dateToYYYYMMDD(new Date(item.eventAt));
        scheduledList.push({
          ...item,
          date: eventAt,
          type: SCHEDULE_TYPE.STAGE,
        } as ParsedStageSchedule);
        if (item.expectedAnnouncementAt) {
          const expectedAnnouncementAt = dateToYYYYMMDD(new Date(item.expectedAnnouncementAt));
          scheduledList.push({
            ...item,
            date: expectedAnnouncementAt,
            type: SCHEDULE_TYPE.ANNOUNCEMENT,
          } as ParsedStageSchedule);
        }
      }
      hydrateScheduleItemsRef.current(scheduledList);
    };

    const fetchTodos = async () => {
      const list = await todoApi.getList({ startDate: startIso, endDate: endIso });
      hydrateTodoItemsRef.current(list);
    };

    fetchSchedules();
    fetchTodos();
  }, [startIso, endIso]);

  // 날짜별로 정렬하여 Map으로 저장
  const sortedScheduleMap = useMemo(() => {
    const map = new Map<string, ParsedStageSchedule[]>();

    for (const item of scheduleItems) {
      const arr = map.get(item.date) ?? [];
      arr.push(item);
      map.set(item.date, arr);
    }

    for (const [k, arr] of map.entries()) {
      arr.sort(sortSchedule);
      map.set(k, arr);
    }

    return map;
  }, [scheduleItems]);

  const sortedTodoMap = useMemo(() => {
    const map = new Map<string, TodoType[]>();

    for (const it of todoItems) {
      const arr = map.get(it.date) ?? [];
      arr.push(it);
      map.set(it.date, arr);
    }

    for (const [k, arr] of map.entries()) {
      arr.sort(sortTodo);
      map.set(k, arr);
    }

    return map;
  }, [todoItems]);

  return (
    <section className="bg-white shrink-0 rounded-3xl px-4 py-6 shadow-default flex flex-col gap-6">
      <header className="w-full flex flex-row items-center justify-between gap-3">
        <section className="flex items-center gap-3">
          <button onClick={prevWeek} className="rounded-lg hover:bg-gray-50">
            <ChevronLeftIcon className={'text-black'} width={32} height={32} />
          </button>

          <span className="text-base text-black font-medium">{weekLabel}</span>

          <button onClick={nextWeek} className="rounded-lg hover:bg-gray-50">
            <ChevronRightIcon className={'text-black'} width={32} height={32} />
          </button>
        </section>

        <button
          onClick={goToday}
          className="py-2 text-xs text-disabled font-medium hover:text-black"
        >
          오늘로 이동하기
        </button>
      </header>

      {/* ✅ 7x2 Grid (정렬 안정) */}
      <section className="grid grid-cols-7 gap-3">
        {week1.map(date => {
          const key = dateToYYYYMMDD(date);
          return (
            <CalendarCell
              key={key}
              date={date}
              today={today}
              scheduleList={sortedScheduleMap.get(key) ?? []}
              todoList={sortedTodoMap.get(key) ?? []}
            />
          );
        })}
        {week2.map(date => {
          const key = dateToYYYYMMDD(date);
          return (
            <CalendarCell
              key={key}
              date={date}
              today={today}
              scheduleList={sortedScheduleMap.get(key) ?? []}
              todoList={sortedTodoMap.get(key) ?? []}
            />
          );
        })}
      </section>
    </section>
  );
}
