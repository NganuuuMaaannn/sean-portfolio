"use client";

import React from "react";

type Props = {
  title: string;
  description: string;
};

export default function ProjectCard({ title, description }: Props) {
  return (
    <div className="p-4 sm:p-6 card rounded-lg shadow hover:shadow-lg transition">
      <h3 className="text-lg sm:text-xl md:text-2xl font-semibold">{title}</h3>
      <p className="mt-2 muted text-sm sm:text-base">{description}</p>
    </div>
  );
}
