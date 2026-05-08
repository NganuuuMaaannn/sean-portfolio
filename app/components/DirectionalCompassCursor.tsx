"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useSpring } from "framer-motion";

type DirectionalCompassCursorProps = {
  cursorImage?: string;
  cursorSize?: number;
  stiffness?: number;
  damping?: number;
  mass?: number;
  hideSystemCursor?: boolean;
  enableBlendMode?: boolean;
  invertIconColors?: boolean;
  enableClickEffect?: boolean;
  fillColor?: string;
  strokeColor?: string;
  hideWhenInsideSelector?: string;
};

const CURSOR_CLASSNAME = "smooth-cursor-hidden";

function DefaultCursorIcon({
  fillColor,
  strokeColor,
}: {
  fillColor: string;
  strokeColor: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
      viewBox="0 0 50 54"
      fill="none"
      aria-hidden="true"
    >
      <g filter="url(#directional-cursor-shadow)">
        <path
          d="M42.6817 41.1495L27.5103 6.79925C26.7269 5.02557 24.2082 5.02558 23.3927 6.79925L7.59814 41.1495C6.75833 42.9759 8.52712 44.8902 10.4125 44.1954L24.3757 39.0496C24.8829 38.8627 25.4385 38.8627 25.9422 39.0496L39.8121 44.1954C41.6849 44.8902 43.4884 42.9759 42.6817 41.1495Z"
          fill={fillColor}
        />
        <path
          d="M43.7146 40.6933L28.5431 6.34306C27.3556 3.65428 23.5772 3.69516 22.3668 6.32755L6.57226 40.6778C5.3134 43.4156 7.97238 46.298 10.803 45.2549L24.7662 40.109C25.0221 40.0147 25.2999 40.0156 25.5494 40.1082L39.4193 45.254C42.2261 46.2953 44.9254 43.4347 43.7146 40.6933Z"
          stroke={strokeColor}
          strokeWidth="2.25825"
        />
      </g>
      <defs>
        <filter
          id="directional-cursor-shadow"
          x="0.602397"
          y="0.952444"
          width="49.0584"
          height="52.428"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="2.25825" />
          <feGaussianBlur stdDeviation="2.25825" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
}

export default function DirectionalCompassCursor({
  cursorImage,
  cursorSize = 40,
  stiffness = 400,
  damping = 45,
  mass = 1,
  hideSystemCursor = true,
  enableBlendMode = false,
  invertIconColors = false,
  enableClickEffect = true,
  fillColor = invertIconColors ? "#0b0b0b" : "#ffffff",
  strokeColor = invertIconColors ? "#000000" : "#000000",
  hideWhenInsideSelector,
}: DirectionalCompassCursorProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isSuppressed, setIsSuppressed] = useState(false);

  const cursorX = useSpring(-100, { stiffness, damping, mass });
  const cursorY = useSpring(-100, { stiffness, damping, mass });
  const rotation = useSpring(0, { stiffness: 300, damping: 60 });
  const scale = useSpring(1, { stiffness: 500, damping: 35 });

  const lastMousePosition = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const lastUpdateTime = useRef(0);
  const previousAngle = useRef(0);
  const accumulatedRotation = useRef(0);
  const scaleResetTimeoutRef = useRef<number | null>(null);
  const isMouseDownRef = useRef(false);
  const suppressedRef = useRef(false);
  const visibleRef = useRef(false);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    if (!hideSystemCursor) {
      document.documentElement.classList.remove(CURSOR_CLASSNAME);
      return;
    }

    document.documentElement.classList.add(CURSOR_CLASSNAME);

    return () => {
      document.documentElement.classList.remove(CURSOR_CLASSNAME);
    };
  }, [hideSystemCursor]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const clearScaleReset = () => {
      if (scaleResetTimeoutRef.current !== null) {
        window.clearTimeout(scaleResetTimeoutRef.current);
        scaleResetTimeoutRef.current = null;
      }
    };

    const updateVelocity = (currentPosition: { x: number; y: number }) => {
      const currentTime = Date.now();
      const deltaTime = currentTime - lastUpdateTime.current;

      if (deltaTime > 0) {
        velocity.current = {
          x: (currentPosition.x - lastMousePosition.current.x) / deltaTime,
          y: (currentPosition.y - lastMousePosition.current.y) / deltaTime,
        };
      }

      lastUpdateTime.current = currentTime;
      lastMousePosition.current = currentPosition;
    };

    const updateSuppression = (nextSuppressed: boolean) => {
      if (suppressedRef.current === nextSuppressed) {
        return;
      }

      suppressedRef.current = nextSuppressed;
      setIsSuppressed(nextSuppressed);
    };

    const updateHiddenSectionState = (currentPosition: { x: number; y: number }) => {
      if (!hideWhenInsideSelector) {
        updateSuppression(false);
        return;
      }

      const hiddenSection = document.querySelector(hideWhenInsideSelector);
      if (!(hiddenSection instanceof HTMLElement)) {
        updateSuppression(false);
        return;
      }

      const sectionBounds = hiddenSection.getBoundingClientRect();
      const nextSuppressed =
        currentPosition.x >= sectionBounds.left &&
        currentPosition.x <= sectionBounds.right &&
        currentPosition.y >= sectionBounds.top &&
        currentPosition.y <= sectionBounds.bottom;

      updateSuppression(nextSuppressed);
    };

    const updateCursorPosition = (currentPosition: { x: number; y: number }) => {
      updateVelocity(currentPosition);
      updateHiddenSectionState(currentPosition);

      // Clamp cursor position to prevent overlap with scrollbars
      const maxX = document.documentElement.clientWidth - cursorSize / 2;
      const maxY = document.documentElement.clientHeight - cursorSize / 2;
      const clampedX = Math.min(currentPosition.x, maxX);
      const clampedY = Math.min(currentPosition.y, maxY);

      const speed = Math.hypot(velocity.current.x, velocity.current.y);

      cursorX.set(clampedX);
      cursorY.set(clampedY);

      if (speed <= 0.1) {
        return;
      }

      const currentAngle =
        (Math.atan2(velocity.current.y, velocity.current.x) * 180) / Math.PI + 90;

      let angleDifference = currentAngle - previousAngle.current;

      if (angleDifference > 180) {
        angleDifference -= 360;
      }

      if (angleDifference < -180) {
        angleDifference += 360;
      }

      accumulatedRotation.current += angleDifference;
      previousAngle.current = currentAngle;
      rotation.set(accumulatedRotation.current);

      if (isMouseDownRef.current) {
        return;
      }

      scale.set(0.95);
      clearScaleReset();
      scaleResetTimeoutRef.current = window.setTimeout(() => {
        if (!isMouseDownRef.current) {
          scale.set(1);
        }
      }, 150);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") {
        return;
      }

      if (!visibleRef.current) {
        visibleRef.current = true;
        setIsVisible(true);
      }

      const currentPosition = { x: event.clientX, y: event.clientY };
      updateCursorPosition(currentPosition);
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType === "touch") {
        return;
      }

      if (!visibleRef.current) {
        visibleRef.current = true;
        setIsVisible(true);
      }
      updateHiddenSectionState({ x: event.clientX, y: event.clientY });
      isMouseDownRef.current = true;

      if (enableClickEffect) {
        clearScaleReset();
        scale.set(0.7);
      }
    };

    const handlePointerUp = () => {
      isMouseDownRef.current = false;
      clearScaleReset();
      scale.set(1);
    };

    const handleWindowMouseOut = (event: MouseEvent) => {
      if (event.relatedTarget === null) {
        visibleRef.current = false;
        setIsVisible(false);
        updateSuppression(false);
        handlePointerUp();
      }
    };

    const handleWindowBlur = () => {
      visibleRef.current = false;
      setIsVisible(false);
      updateSuppression(false);
      handlePointerUp();
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
    window.addEventListener("mouseout", handleWindowMouseOut);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
      window.removeEventListener("mouseout", handleWindowMouseOut);
      window.removeEventListener("blur", handleWindowBlur);

      clearScaleReset();
    };
  }, [
    cursorX,
    cursorY,
    enableClickEffect,
    hideWhenInsideSelector,
    rotation,
    scale,
  ]);

  return (
    <motion.div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        x: cursorX,
        y: cursorY,
        rotate: rotation,
        scale,
        opacity: isVisible && !isSuppressed ? 1 : 0,
        zIndex: 999999,
        pointerEvents: "none",
        willChange: "transform",
        mixBlendMode: enableBlendMode ? "difference" : "normal",
        width: cursorSize,
        height: cursorSize,
        marginLeft: -cursorSize / 2,
        marginTop: -cursorSize / 2,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {cursorImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={cursorImage}
          alt=""
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
          />
      ) : (
        <DefaultCursorIcon fillColor={fillColor} strokeColor={strokeColor} />
      )}
    </motion.div>
  );
}
