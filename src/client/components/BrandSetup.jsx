import React from 'react';
import { BRAND_DEFAULTS, TONES } from '../../config/brandProfile';

function BrandSetup({ brand, setBrand, onNext }) {
    const handleChange = (field, value) => {
        setBrand(prev => ({ ...prev, [field]: value }));
    };

    const handleColorChange = (key, value) => {
        setBrand(prev => ({
            ...prev,
            colors: { ...prev.colors, [key]: value }
        }));
    };

    return (
        <div className="max-w-2xl mx-auto animate-slideUp">
            <div className="card">
                <h2 className="text-2xl font-bold mb-6 gradient-text">Brand Identity</h2>

                {/* Brand Name */}
                <div className="form-group">
                    <label className="label">Brand Name</label>
                    <input
                        type="text"
                        className="input text-lg"
                        value={brand.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="Ex. Acme Corp"
                    />
                </div>

                {/* Colors */}
                <div className="form-group">
                    <label className="label">Brand Colors</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {Object.entries(brand.colors).map(([key, val]) => (
                            <div key={key} className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700">
                                <span className="text-xs uppercase text-zinc-500 mb-2 block">{key}</span>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        className="w-8 h-8 rounded cursor-pointer bg-transparent"
                                        value={val}
                                        onChange={(e) => handleColorChange(key, e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        className="input py-1 text-sm font-mono"
                                        value={val}
                                        onChange={(e) => handleColorChange(key, e.target.value)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tone */}
                <div className="form-group">
                    <label className="label">Brand Tone</label>
                    <div className="grid grid-cols-2 gap-3">
                        {Object.keys(TONES).map((toneKey) => (
                            <button
                                key={toneKey}
                                onClick={() => handleChange('tone', toneKey)}
                                className={`p-4 rounded-lg border text-left transition-all ${brand.tone === toneKey
                                        ? 'border-sky-500 bg-sky-500/10'
                                        : 'border-zinc-700 hover:border-zinc-600'
                                    }`}
                            >
                                <div className="font-semibold capitalize">{toneKey}</div>
                            </button>
                        ))}
                    </div>
                </div>

                <button onClick={onNext} className="btn btn-primary w-full mt-6 text-lg">
                    Save Brand Profile →
                </button>
            </div>
        </div>
    );
}

export default BrandSetup;
