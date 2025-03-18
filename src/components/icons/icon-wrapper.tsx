import { cn } from "@/lib/utils";

export interface IconWrapperProps extends React.SVGProps<SVGSVGElement> {
  children?: React.ReactNode;
  gradient?: boolean;
  color?: string;
}

export default function IconWrapper({ children, gradient, color = 'currentColor', className, ...props }: IconWrapperProps) {
  const gradientId =
    'icon-gradient-' + Math.round(Math.random() * 10e12).toString(36);
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 18 18"
      aria-hidden="true"
      stroke={gradient ? `url(#${gradientId})` : color}
      fill={gradient ? `url(#${gradientId})` : color}
      className={cn("inline-block align-middle mt-[1px]", className)}
      {...props}
    >
      {children}
    </svg>
  );
}
