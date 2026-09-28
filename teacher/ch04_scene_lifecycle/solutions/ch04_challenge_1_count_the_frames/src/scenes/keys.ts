// keys.ts - the name of every scene, and of the settings the scenes share through the registry

export const LOG_SCENE = "LogScene";
export const DEMO_SCENE = "DemoScene";

// registry keys - set by LogScene when a key is pressed, read by DemoScene and Spinner
export const LEAK_MODE = "leakMode";        // true: DemoScene "forgets" to remove its listeners
export const SKIP_SUPER = "skipSuper";      // true: Spinner leaves out super.preUpdate()
