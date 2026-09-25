"use client";

import React, { useState } from "react";
import Image from "next/image";
import { CalendarDays } from "lucide-react";
import { EmptyState, ErrorState, EventCardSkeleton, LoadingRegion } from "@/components/ui/states";
import { Modal, ModalContent } from "@/components/ui/modal";
import { useLanguage } from "@/components/ui/translatetokhmer";
import { useListEventsQuery } from "@/store/api/catalogApi";
import type { PublicEventResponse } from "@/store/api/types";
import "@/app/globals.scss";

const eventDate = (value: string) => new Date(`${value}+07:00`).toLocaleString("en-GB", {
  timeZone: "Asia/Phnom_Penh", dateStyle: "medium", timeStyle: "short",
});

export function EventpageView() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { t } = useLanguage();
  const { data: events = [], isLoading, error, refetch } = useListEventsQuery(undefined, {
    pollingInterval: 30000, refetchOnMountOrArgChange: true,
  });
  const selected = events.find((event) => event.id === selectedId);
  const imageFor = (event: PublicEventResponse) => event.imageUrl || "/images/590st cafe.jpg";

  return (
    <div className="events_container">
      <div className="events_wrapper">
        <div className="header_section">
          <h1 className="header_title">{t("Events at 590st Cafe")}</h1>
          <p className="header_description">{t("Discover our upcoming events and celebrations.")}</p>
        </div>
        {isLoading ? (
          <LoadingRegion label="Loading events..." className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </LoadingRegion>
        ) : error && events.length === 0 ? (
          <ErrorState
            title="We couldn't load events"
            error={error}
            onRetry={() => void refetch()}
          />
        ) : events.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No upcoming events"
            message="No upcoming events yet. Check back soon!"
          />
        ) : (
        <div className="bento_grid">
          {events.map((event) => (
            <button type="button" key={event.id} onClick={() => setSelectedId(event.id)}
              className="event_card text-left">
              <Image src={imageFor(event)} alt={event.title} fill unoptimized
                sizes="(max-width: 768px) 100vw, 50vw" className="card_image" />
              <div className="card_overlay" />
              <div className="card_content">
                <h3 className="card_title text-lg font-bold text-white" style={{ color: "#fff" }}>{event.title}</h3>
                <p className="card_description line-clamp-2">{event.description}</p>
                <p className="mt-2 flex items-center gap-2 text-xs text-white"><CalendarDays className="h-4 w-4" />{eventDate(event.startAt)}</p>
              </div>
            </button>
          ))}
        </div>
        )}
      </div>
      <Modal open={Boolean(selected)} onOpenChange={(open) => { if (!open) setSelectedId(null); }}>
        <ModalContent className="max-w-lg overflow-hidden rounded-2xl p-0" aria-label={selected?.title}>
          {selected && <>
            <div className="relative h-56"><Image src={imageFor(selected)} alt={selected.title} fill unoptimized className="object-cover" /></div>
            <div className="space-y-3 p-6">
              <h2 className="text-xl font-bold">{selected.title}</h2>
              <p className="text-sm text-gray-500">{eventDate(selected.startAt)} – {eventDate(selected.endAt)}</p>
              <p className="whitespace-pre-wrap text-sm text-gray-700">{selected.description}</p>
            </div>
          </>}
        </ModalContent>
      </Modal>
    </div>
  );
}

export default EventpageView;
