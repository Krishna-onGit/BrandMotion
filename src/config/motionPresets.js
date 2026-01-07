/**
 * BrandMotion - Motion Presets
 * The physics engine definitions. Users pick the ID, system applies the curves.
 */

export const MOTION_PRESETS = {
    // ENTRY ANIMATIONS (Ease Out)
    fadeIn: {
        id: "fadeIn",
        name: "Fade In",
        type: "entry",
        props: { opacity: [0, 1] },
        curve: "cubic-bezier(0, 0, 0.2, 1)", // Linear-ish ease out
        staggerBase: 0.1 // Stagger delay per word
    },
    slideUp: {
        id: "slideUp",
        name: "Slide Up",
        type: "entry",
        props: {
            opacity: [0, 1],
            transform: ["translateY(60px)", "translateY(0)"]
        },
        curve: "cubic-bezier(0.16, 1, 0.3, 1)", // Smooth distinct ease out
        staggerBase: 0.15
    },
    slideLeft: {
        id: "slideLeft",
        name: "Slide Left",
        type: "entry",
        props: {
            opacity: [0, 1],
            transform: ["translateX(60px)", "translateX(0)"]
        },
        curve: "cubic-bezier(0.16, 1, 0.3, 1)",
        staggerBase: 0.1
    },
    scaleIn: {
        id: "scaleIn",
        name: "Scale In",
        type: "entry",
        props: {
            opacity: [0, 1],
            transform: ["scale(0.8)", "scale(1)"]
        },
        curve: "cubic-bezier(0.34, 1.56, 0.64, 1)", // Slight overshoot
        staggerBase: 0.05
    },
    typewriter: {
        id: "typewriter",
        name: "Typewriter",
        type: "entry",
        special: true, // Handled differently in CSS generator
        curve: "steps(1, end)"
    },

    // EXIT ANIMATIONS (Ease In - Automatically paired)
    fadeOut: {
        id: "fadeOut",
        type: "exit",
        props: { opacity: [1, 0] },
        curve: "cubic-bezier(0.4, 0, 1, 1)"
    },
    slideAway: {
        id: "slideAway",
        type: "exit",
        props: {
            opacity: [1, 0],
            transform: ["translateY(0)", "translateY(-40px)"]
        },
        curve: "cubic-bezier(0.4, 0, 1, 1)"
    },
    scaleOut: {
        id: "scaleOut",
        type: "exit",
        props: {
            opacity: [1, 0],
            transform: ["scale(1)", "scale(0.9)"]
        },
        curve: "cubic-bezier(0.4, 0, 1, 1)"
    }
};

// Logic mapping Entry -> Exit
export const EXIT_PAIRS = {
    fadeIn: "fadeOut",
    slideUp: "fadeOut", // slideUp often looks better fading out than sliding further up
    slideLeft: "slideAway",
    scaleIn: "scaleOut",
    typewriter: "fadeOut"
};

export default { MOTION_PRESETS, EXIT_PAIRS };
