import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { IoSettingsOutline, IoClose } from 'react-icons/io5';

type SettingType = 'toggle' | 'stepper' | 'section';

export interface SettingItemBase {
    id: string;
    label: string;
    description?: string;
    type: SettingType;
}

export interface ToggleSetting extends SettingItemBase {
    type: 'toggle';
    value: boolean;
    onChange: (val: boolean) => void;
}

export interface StepperSetting extends SettingItemBase {
    type: 'stepper';
    value: number;
    step: number;
    min?: number;
    max?: number;
    onChange: (val: number) => void;
    formatValue?: (val: number) => string;
}

export interface SectionSetting extends SettingItemBase {
    type: 'section';
    children: AnySettingItem[];
}

export type AnySettingItem = ToggleSetting | StepperSetting | SectionSetting;

interface RoomSettingsProps {
    settings: AnySettingItem[];
}

export default function RoomSettings({ settings }: RoomSettingsProps) {
    const [showSettings, setShowSettings] = useState(false);

    // Prevent scrolling when modal is open
    useEffect(() => {
        if (showSettings) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => { document.body.style.overflow = 'auto'; };
    }, [showSettings]);

    const renderSetting = (setting: AnySettingItem) => {
        if (setting.type === 'section') {
            return (
                <div key={setting.id} className="flex flex-col gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                    <div>
                        <h4 className="text-sm font-semibold text-white/90">{setting.label}</h4>
                        {setting.description && <p className="text-xs text-white/50 mt-1">{setting.description}</p>}
                    </div>
                    <div className="flex flex-col gap-4 mt-2">
                        {setting.children.map(renderSetting)}
                    </div>
                </div>
            );
        }

        if (setting.type === 'toggle') {
            return (
                <div key={setting.id} className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                        <span className="text-sm font-medium text-white/90">{setting.label}</span>
                        {setting.description && <p className="text-xs text-white/50 mt-0.5 leading-relaxed">{setting.description}</p>}
                    </div>
                    <button
                        type="button"
                        onClick={() => setting.onChange(!setting.value)}
                        className={`w-11 h-6 shrink-0 rounded-full relative transition-colors ${setting.value ? 'bg-aura-500' : 'bg-white/20'}`}
                        aria-label={`Toggle ${setting.label}`}
                    >
                        <motion.div
                            layout
                            className={`w-4 h-4 bg-white rounded-full absolute top-1 ${setting.value ? 'right-1' : 'left-1'}`}
                        />
                    </button>
                </div>
            );
        }

        if (setting.type === 'stepper') {
            return (
                <div key={setting.id} className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                        <span className="text-sm font-medium text-white/90">{setting.label}</span>
                        {setting.description && <p className="text-xs text-white/50 mt-0.5 leading-relaxed">{setting.description}</p>}
                    </div>
                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-2 py-1 shrink-0">
                        <button
                            type="button"
                            onClick={() => {
                                const newVal = setting.value - setting.step;
                                if (setting.min === undefined || newVal >= setting.min) setting.onChange(newVal);
                            }}
                            className="w-6 h-6 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/80 transition-colors disabled:opacity-30 hover:cursor-pointer"
                            disabled={setting.min !== undefined && setting.value <= setting.min}
                        >
                            -
                        </button>
                        <span className="text-xs font-semibold text-white/90 min-w-[3rem] text-center">
                            {setting.formatValue ? setting.formatValue(setting.value) : setting.value}
                        </span>
                        <button
                            type="button"
                            onClick={() => {
                                const newVal = setting.value + setting.step;
                                if (setting.max === undefined || newVal <= setting.max) setting.onChange(newVal);
                            }}
                            className="w-6 h-6 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/80 transition-colors disabled:opacity-30 hover:cursor-pointer"
                            disabled={setting.max !== undefined && setting.value >= setting.max}
                        >
                            +
                        </button>
                    </div>
                </div>
            );
        }
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setShowSettings(true)}
                className="h-10 w-10 flex items-center justify-center rounded-full border border-white/12 bg-white/6 hover:bg-white/10 hover:cursor-pointer text-white/70 hover:text-white transition-colors"
                aria-label="Settings"
            >
                <IoSettingsOutline size={20} />
            </button>

            {createPortal(
                <AnimatePresence>
                    {showSettings && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm"
                            onClick={() => setShowSettings(false)}
                        >
                            <motion.div
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                                transition={{ duration: 0.3, type: "spring", bounce: 0.3 }}
                                className="relative w-full max-w-md p-6 rounded-3xl border border-white/12 bg-zinc-900/90 backdrop-blur-2xl shadow-2xl flex flex-col gap-6 max-h-[85vh] overflow-y-auto no-scrollbar"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-display font-semibold text-white/90">Room Settings</h2>
                                    <button
                                        type="button"
                                        onClick={() => setShowSettings(false)}
                                        className="h-8 w-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 hover:cursor-pointer text-white/70 hover:text-white transition-colors"
                                    >
                                        <IoClose size={20} />
                                    </button>
                                </div>

                                <div className="flex flex-col gap-4">
                                    {settings.map(renderSetting)}
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
}
