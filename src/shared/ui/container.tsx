import { PropsWithChildren } from "react";
import { classNames } from "@/shared/lib/classNames";

type ContainerProps = PropsWithChildren<{
  className?: string;
}>;

export function Container({ children, className }: ContainerProps) {
  return (
    <div
      className={classNames(
        "mx-auto w-full max-w-[1600px] px-6 sm:px-8",
        className,
      )}
    >
      {children}
    </div>
  );
}
