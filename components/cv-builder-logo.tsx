type Props = {
    className?: string
}

export const CvBuilderLogo = ({ className }: Props) => {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
            <rect width="24" height="24" rx="6" fill="#2E2E2E" />
            <rect x="8" y="6" width="2.2" height="12" rx="1.1" fill="#F5F5F7" />
            <rect
                x="12.1"
                y="8"
                width="5"
                height="3.6"
                rx="0.7"
                fill="#C63031"
            />
        </svg>
    )
}
