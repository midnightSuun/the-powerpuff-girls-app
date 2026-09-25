import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const buttonVariants = cva(
    "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    {
        variants: {
            variant: {
                primary:
                    "flex items-center justify-center w-40 h-12 rounded-full border border-transparent text-sm font-normal tracking-wider bg-button-primary-default text-text-primary-default transition-colors duration-200 hover:bg-transparent hover:border-button-primary-default hover:text-button-primary-default active:bg-button-primary-active active:border-button-primary-default active:text-button-primary-default disabled:bg-button-disabled disabled:text-primary-disabled",
                secondary:
                    "flex items-center justify-center w-40 h-12 rounded-full border border-button-secondary-default bg-transparent text-button-secondary-default text-sm font-normal tracking-wider transition-colors duration-200 hover:bg-button-disabled hover:text-text-primary-default active:bg-button-secondary-default active:border-button-secondary-default active:text-text-primary-default disabled:bg-button-disabled disabled:border-transparent disabled:text-text-primary-disabled",
                primaryV2:
                    "flex items-center justify-center w-40 h-12 rounded-full border border-transparent bg-transparent text-button-primary-default hover:bg-transparent hover:border-button-primary-default hover:text-button-primary-default active:bg-button-primary-active active:border-button-primary-default active:text-button-primary-default disabled:bg-button-disabled disabled:border-transparent disabled:text-text-primary-disabled",
                ghost: "flex items-center justify-center w-40 h-12 rounded-full border border-transparent bg-transparent text-button-secondary-default hover:border-button-secondary-default hover:bg-transparent hover:text-button-secondary-default active:bg-button-disabled active:text-button-secondary-default disabled:bg-button-disabled disabled:border-transparent disabled:text-text-primary-disabled",
            },
            size: {
                default:
                    "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
                xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
                sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
                lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
                icon: "size-8",
                "icon-xs":
                    "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
                "icon-sm":
                    "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
                "icon-lg": "size-9",
            },
        },
        defaultVariants: {
            variant: "primary",
            size: "default",
        },
    },
)

function Button({
    className,
    variant = "primary",
    size = "default",
    ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
    return (
        <ButtonPrimitive
            data-slot="button"
            className={cn(buttonVariants({ variant, size, className }))}
            {...props}
        />
    )
}

export { Button, buttonVariants }
