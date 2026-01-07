/**
 * BrandMotion - Use Case Templates
 * Pre-defined story structures to guide the user.
 */

export const TEMPLATES = [
    {
        id: "brand-intro",
        name: "Brand Intro",
        description: "Introduce your brand, logo, and tagline in 15 seconds.",
        defaultDuration: "medium",
        scenes: [
            {
                id: "s1",
                type: "intro",
                label: "Logo Reveal",
                headline: "Welcome to",
                subtext: "Your Brand Name",
                animation: "scaleIn",
                duration: "medium" // 5s
            },
            {
                id: "s2",
                type: "message",
                label: "Mission Statement",
                headline: "We create future",
                subtext: "Building the next generation of tools.",
                animation: "slideUp",
                duration: "medium"
            },
            {
                id: "s3",
                type: "cta",
                label: "Website CTA",
                headline: "Visit us today",
                subtext: "www.example.com",
                animation: "fadeIn",
                duration: "long" // 7s
            }
        ]
    },
    {
        id: "product-launch",
        name: "Product Launch",
        description: "Showcase a new feature or product release.",
        defaultDuration: "fast",
        scenes: [
            {
                id: "s1",
                type: "intro",
                label: "The Problem",
                headline: "Tired of waiting?",
                subtext: "",
                animation: "slideUp",
                duration: "short" // 3s
            },
            {
                id: "s2",
                type: "highlight",
                label: "The Solution",
                headline: "Meet SpeedTool",
                subtext: "10x faster workflow.",
                animation: "scaleIn",
                duration: "medium"
            },
            {
                id: "s3",
                type: "highlight",
                label: "Key Benefit",
                headline: "Save hours daily",
                subtext: "Automate boring tasks.",
                animation: "slideLeft",
                duration: "medium"
            },
            {
                id: "s4",
                type: "cta",
                label: "Call to Action",
                headline: "Get it now",
                subtext: "Link in bio",
                animation: "fadeIn",
                duration: "medium"
            }
        ]
    }
];

export const SCENE_DURATIONS = {
    short: 3000,
    medium: 5000,
    long: 7000
};

export default { TEMPLATES, SCENE_DURATIONS };
