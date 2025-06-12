import Image from "next/image";

type LoaderProps = {
  text: string;
};
export default function Loader({ text }: LoaderProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-[#F5F3F0] via-[#FDF8F5] to-[#F9F6F3] px-4">
      {/* Orange glow behind center */}
      <div className="absolute w-64 h-64 bg-[#FF6B35] opacity-20 blur-3xl rounded-full z-0"></div>

      {/* Spinning sparkle element */}
      <div className="absolute top-10 right-10 animate-spin-slow z-0 opacity-30">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          fill="#FF6B35"
          viewBox="0 0 24 24"
        >
          <path d="M12 0l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" />
        </svg>
      </div>

      {/* Main loader content */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-4">
        <div className="h-20 w-20 rounded-full bg-white shadow-lg flex items-center justify-center">
          <Image src="/navlogo.png" alt="Loading logo" width={48} height={48} />
        </div>
        <h2 className="text-2xl font-bold text-[#2D3748]">
          Redirecting {text}
        </h2>
        <p className="text-[#718096]">Please wait a moment.</p>
        <div>
          <svg
            className="h-8 w-8 text-[#FF6B35] animate-spin mx-auto"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
