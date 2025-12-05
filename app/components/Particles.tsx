"use client";

type Props = {
  mousePosition: { x: number; y: number };
  windowSize: { width: number; height: number };
};

export default function Particles({ mousePosition, windowSize }: Props) {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Large Cyan */}
      <div
        className="absolute w-96 h-96 bg-linear-to-br from-cyan-500 to-transparent rounded-full blur-3xl opacity-20"
        style={{
          top: "10%",
          left: "10%",
          transform: `translate(${(mousePosition.x - windowSize.width / 2) * 0.05}px, ${(mousePosition.y - windowSize.height / 2) * 0.05}px)`
        }}
      ></div>
      {/* Large Yellow */}
      <div
        className="absolute w-80 h-80 bg-linear-to-br from-yellow-400 to-transparent rounded-full blur-3xl opacity-20"
        style={{
          top: "50%",
          right: "5%",
          animationDelay: "1s",
          transform: `translate(${(mousePosition.x - windowSize.width / 2) * 0.08}px, ${(mousePosition.y - windowSize.height / 2) * 0.08}px)`
        }}
      ></div>
      {/* Large Blue */}
      <div
        className="absolute w-96 h-96 bg-linear-to-br from-blue-500 to-transparent rounded-full blur-3xl opacity-20"
        style={{
          bottom: "10%",
          left: "30%",
          animationDelay: "2s",
          transform: `translate(${(mousePosition.x - windowSize.width / 2) * 0.06}px, ${(mousePosition.y - windowSize.height / 2) * 0.06}px)`
        }}
      ></div>

      {/* Medium Purple */}
      <div
        className="absolute w-72 h-72 bg-linear-to-br from-purple-500 to-transparent rounded-full blur-2xl opacity-15"
        style={{
          top: "25%",
          right: "20%",
          animationDelay: "0.5s",
          transform: `translate(${(mousePosition.x - windowSize.width / 2) * 0.07}px, ${(mousePosition.y - windowSize.height / 2) * 0.07}px)`
        }}
      ></div>
      {/* Medium Pink */}
      <div
        className="absolute w-64 h-64 bg-linear-to-br from-pink-500 to-transparent rounded-full blur-2xl opacity-15"
        style={{
          bottom: "25%",
          right: "25%",
          animationDelay: "1.5s",
          transform: `translate(${(mousePosition.x - windowSize.width / 2) * 0.065}px, ${(mousePosition.y - windowSize.height / 2) * 0.065}px)`
        }}
      ></div>
      {/* Medium Green */}
      <div
        className="absolute w-60 h-60 bg-linear-to-br from-green-500 to-transparent rounded-full blur-2xl opacity-15"
        style={{
          top: "60%",
          left: "15%",
          animationDelay: "0.3s",
          transform: `translate(${(mousePosition.x - windowSize.width / 2) * 0.075}px, ${(mousePosition.y - windowSize.height / 2) * 0.075}px)`
        }}
      ></div>

      {/* Small Orange */}
      <div
        className="absolute w-48 h-48 bg-linear-to-br from-orange-500 to-transparent rounded-full blur-xl opacity-20"
        style={{
          top: "35%",
          left: "65%",
          animationDelay: "1.2s",
          transform: `translate(${(mousePosition.x - windowSize.width / 2) * 0.09}px, ${(mousePosition.y - windowSize.height / 2) * 0.09}px)`
        }}
      ></div>
      {/* Small Red */}
      <div
        className="absolute w-40 h-40 bg-linear-to-br from-red-500 to-transparent rounded-full blur-xl opacity-20"
        style={{
          bottom: "20%",
          right: "10%",
          animationDelay: "0.8s",
          transform: `translate(${(mousePosition.x - windowSize.width / 2) * 0.095}px, ${(mousePosition.y - windowSize.height / 2) * 0.095}px)`
        }}
      ></div>
      {/* Small Indigo */}
      <div
        className="absolute w-56 h-56 bg-linear-to-br from-indigo-500 to-transparent rounded-full blur-xl opacity-15"
        style={{
          top: "70%",
          right: "35%",
          animationDelay: "0.2s",
          transform: `translate(${(mousePosition.x - windowSize.width / 2) * 0.085}px, ${(mousePosition.y - windowSize.height / 2) * 0.085}px)`
        }}
      ></div>
      {/* Small Teal */}
      <div
        className="absolute w-44 h-44 bg-linear-to-br from-teal-500 to-transparent rounded-full blur-xl opacity-15"
        style={{
          top: "15%",
          right: "40%",
          animationDelay: "1.7s",
          transform: `translate(${(mousePosition.x - windowSize.width / 2) * 0.095}px, ${(mousePosition.y - windowSize.height / 2) * 0.095}px)`
        }}
      ></div>
    </div>
  );
}
