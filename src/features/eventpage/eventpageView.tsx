"use client";

import React, { useState } from "react";
import Image from "next/image";
import { CalendarDays } from "lucide-react";
import { Modal, ModalContent } from "@/components/ui/modal";
import { useLanguage } from "@/components/ui/translatetokhmer";
import { useListEventsQuery } from "@/store/api/catalogApi";
import { apiErrorMessage } from "@/store/api/baseApi";
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
        {isLoading && <p role="status">{t("Loading events...")}</p>}
        {error && <div role="alert" className="rounded-xl border border-red-200 p-4 text-red-700">
          <p>{apiErrorMessage(error as never, "Could not load events.")}</p>
          <button type="button" onClick={() => { void refetch(); }} className="mt-2 underline">{t("Try again")}</button>
        </div>}
        {!isLoading && !error && events.length === 0 && <p className="py-10 text-center text-gray-500">
          {t("No upcoming events yet. Check back soon!")}
        </p>}
        <div className="bento_grid">
          {events.map((event, index) => (
            <button type="button" key={event.id} onClick={() => setSelectedId(event.id)}
              className={`event_card text-left ${index % 5 === 0 ? "span_col_2" : "span_col_1"}`}>
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
