type SkeletonProps = {
  pulse?: boolean;
  className?: string;
};

export const Skeleton = ({ className, pulse = true }: SkeletonProps) => {
  return (
    <div
      className={className ? `${className} bg-slate-600 animate-pulse` : `${pulse ? "animate-pulse" : ""} bg-slate-600 w-full h-4`}
    ></div>
  );
};
