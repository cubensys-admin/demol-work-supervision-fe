import { PropsWithChildren } from "react";
import { classNames } from "@/shared/lib/classNames";

type SectionLabelProps = PropsWithChildren<{
  className?: string;
}>;

export function SectionLabel({ children, className }: SectionLabelProps) {
  return (
    <div className={classNames("mt-20 h-[50px]", className)}>
      <p className="flex h-full items-center whitespace-nowrap text-[36px] font-semibold leading-[50.4px] tracking-[-0.9px] text-heading">
        {children}
      </p>
    </div>
  );
}
