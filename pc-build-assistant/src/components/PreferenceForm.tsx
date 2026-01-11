/**
 * PreferenceForm Component
 * Collects user preferences for PC build
 * Requirements: 1.1, 1.2, 1.3, 1.4
 */

import React, { useState } from 'react';
import { UserPreferences } from '../types/build';
import './PreferenceForm.css';

interface PreferenceFormProps {
    mode: 'beginner' | 'advanced';
    onSubmit: (preferences: UserPreferences) => void;
}

export const PreferenceForm: React.FC<PreferenceFormProps> = ({ mode, onSubmit }) => {
    const [budgetMin, setBudgetMin] = useState<string>('');
    const [budgetMax, setBudgetMax] = useState<string>('');
    const [useCase, setUseCase] = useState<UserPreferences['useCase']>('gaming');
    const [performanceFocus, setPerformanceFocus] = useState<UserPreferences['performanceFocus']>('balanced');
    const [storageRequirements, setStorageRequirements] = useState<UserPreferences['storageRequirements']>('moderate');
    const [upgradeHorizon, setUpgradeHorizon] = useState<UserPreferences['upgradeHorizon']>('3-year');
    const [brandPreferences, setBrandPreferences] = useState<string>('');
    const [powerConstraints, setPowerConstraints] = useState<string>('');
    // Advanced constraints
    const [preferredRamType, setPreferredRamType] = useState<string>('');
    const [preferredFormFactor, setPreferredFormFactor] = useState<string>('');
    const [minimumCores, setMinimumCores] = useState<string>('');
    const [minimumVRAM, setMinimumVRAM] = useState<string>('');
    const [requireIntegratedGraphics, setRequireIntegratedGraphics] = useState<boolean>(false);
    const [psuEfficiencyRating, setPsuEfficiencyRating] = useState<string>('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        // Validate budget
        const minBudget = parseFloat(budgetMin);
        const maxBudget = parseFloat(budgetMax);

        if (!budgetMin || isNaN(minBudget) || minBudget <= 0) {
            newErrors.budgetMin = 'Please enter a valid minimum budget';
        }

        if (!budgetMax || isNaN(maxBudget) || maxBudget <= 0) {
            newErrors.budgetMax = 'Please enter a valid maximum budget';
        }

        if (minBudget && maxBudget && minBudget >= maxBudget) {
            newErrors.budgetMax = 'Maximum budget must be greater than minimum budget';
        }

        // Advanced mode validations
        if (mode === 'advanced') {
            if (powerConstraints && (isNaN(parseFloat(powerConstraints)) || parseFloat(powerConstraints) <= 0)) {
                newErrors.powerConstraints = 'Please enter a valid power constraint';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const preferences: UserPreferences = {
            budgetMin: parseFloat(budgetMin),
            budgetMax: parseFloat(budgetMax),
            useCase,
            performanceFocus,
            storageRequirements,
            upgradeHorizon,
        };

        // Add advanced mode fields if present
        if (brandPreferences.trim()) {
            preferences.brandPreferences = brandPreferences
                .split(',')
                .map(b => b.trim())
                .filter(b => b.length > 0);
        }

        if (mode === 'advanced') {
            if (powerConstraints) {
                preferences.powerConstraints = parseFloat(powerConstraints);
            }
            if (preferredRamType) {
                preferences.preferredRamType = preferredRamType as 'DDR4' | 'DDR5';
            }
            if (preferredFormFactor) {
                preferences.preferredFormFactor = preferredFormFactor as 'ATX' | 'Micro-ATX' | 'Mini-ITX';
            }
            if (minimumCores) {
                preferences.minimumCores = parseInt(minimumCores);
            }
            if (minimumVRAM) {
                preferences.minimumVRAM = parseInt(minimumVRAM);
            }
            if (requireIntegratedGraphics) {
                preferences.requireIntegratedGraphics = requireIntegratedGraphics;
            }
            if (psuEfficiencyRating) {
                preferences.psuEfficiencyRating = psuEfficiencyRating as '80+ Bronze' | '80+ Gold' | '80+ Platinum';
            }
        }

        onSubmit(preferences);
    };

    return (
        <form className="preference-form" onSubmit={handleSubmit} aria-labelledby="form-title">
            <h2 id="form-title">{mode === 'beginner' ? 'Tell us about your PC needs' : 'Configure Your Build Preferences'}</h2>

            {/* Budget Section */}
            <div className="form-section">
                <div className="section-header">
                    <div className="section-icon">💰</div>
                    <h3>{mode === 'beginner' ? 'What\'s your budget?' : 'Budget Range'}</h3>
                </div>
                <div className="form-row">
                    <div className="form-field">
                        <label htmlFor="budgetMin">
                            {mode === 'beginner' ? 'Minimum ($)' : 'Minimum Budget ($)'}
                        </label>
                        <input
                            id="budgetMin"
                            type="number"
                            value={budgetMin}
                            onChange={(e) => setBudgetMin(e.target.value)}
                            placeholder="e.g., 800"
                            min="0"
                            step="50"
                        />
                        {errors.budgetMin && <span className="error">{errors.budgetMin}</span>}
                    </div>
                    <div className="form-field">
                        <label htmlFor="budgetMax">
                            {mode === 'beginner' ? 'Maximum ($)' : 'Maximum Budget ($)'}
                        </label>
                        <input
                            id="budgetMax"
                            type="number"
                            value={budgetMax}
                            onChange={(e) => setBudgetMax(e.target.value)}
                            placeholder="e.g., 1500"
                            min="0"
                            step="50"
                        />
                        {errors.budgetMax && <span className="error">{errors.budgetMax}</span>}
                    </div>
                </div>
            </div>

            {/* Use Case Section */}
            <div className="form-section">
                <div className="section-header">
                    <div className="section-icon">🎮</div>
                    <h3>{mode === 'beginner' ? 'What will you use your PC for?' : 'Primary Use Case'}</h3>
                </div>
                <div className="form-field">
                    <label htmlFor="useCase">Use Case</label>
                    <select
                        id="useCase"
                        value={useCase}
                        onChange={(e) => setUseCase(e.target.value as UserPreferences['useCase'])}
                    >
                        <option value="gaming">Gaming</option>
                        <option value="productivity">Productivity</option>
                        <option value="mixed">Mixed Use</option>
                        <option value="content-creation">Content Creation</option>
                    </select>
                </div>
            </div>

            {/* Performance Focus Section */}
            <div className="form-section">
                <div className="section-header">
                    <div className="section-icon">⚡</div>
                    <h3>{mode === 'beginner' ? 'What matters most to you?' : 'Performance Focus'}</h3>
                </div>
                <div className="form-field">
                    <label htmlFor="performanceFocus">
                        {mode === 'beginner' ? 'Priority' : 'Performance Priority'}
                    </label>
                    <select
                        id="performanceFocus"
                        value={performanceFocus}
                        onChange={(e) => setPerformanceFocus(e.target.value as UserPreferences['performanceFocus'])}
                    >
                        <option value="GPU-heavy">Graphics Performance (GPU-heavy)</option>
                        <option value="CPU-heavy">Processing Power (CPU-heavy)</option>
                        <option value="balanced">Balanced Performance</option>
                    </select>
                </div>
            </div>

            {/* Storage Requirements Section */}
            <div className="form-section">
                <div className="section-header">
                    <div className="section-icon">💾</div>
                    <h3>{mode === 'beginner' ? 'How much storage do you need?' : 'Storage Requirements'}</h3>
                </div>
                <div className="form-field">
                    <label htmlFor="storageRequirements">Storage Needs</label>
                    <select
                        id="storageRequirements"
                        value={storageRequirements}
                        onChange={(e) => setStorageRequirements(e.target.value as UserPreferences['storageRequirements'])}
                    >
                        <option value="minimal">Minimal (500GB - 1TB)</option>
                        <option value="moderate">Moderate (1TB - 2TB)</option>
                        <option value="extensive">Extensive (2TB+)</option>
                    </select>
                </div>
            </div>

            {/* Upgrade Horizon Section */}
            <div className="form-section">
                <div className="section-header">
                    <div className="section-icon">🔮</div>
                    <h3>{mode === 'beginner' ? 'How long do you want this PC to last?' : 'Upgrade Horizon'}</h3>
                </div>
                <div className="form-field">
                    <label htmlFor="upgradeHorizon">
                        {mode === 'beginner' ? 'Expected Lifespan' : 'Upgrade Timeline'}
                    </label>
                    <select
                        id="upgradeHorizon"
                        value={upgradeHorizon}
                        onChange={(e) => setUpgradeHorizon(e.target.value as UserPreferences['upgradeHorizon'])}
                    >
                        <option value="1-year">1 Year (Budget-focused)</option>
                        <option value="3-year">3 Years (Balanced)</option>
                        <option value="5-year">5+ Years (Future-proof)</option>
                    </select>
                </div>
            </div>

            {/* Brand Preferences Section - Now in both modes */}
            <div className="form-section">
                <div className="section-header">
                    <div className="section-icon">🏢</div>
                    <h3>{mode === 'beginner' ? 'Do you prefer any brands?' : 'Brand Preferences'}</h3>
                </div>
                <div className="form-field">
                    <label>{mode === 'beginner' ? 'Preferred Brands (Optional)' : 'Preferred Brands'}</label>
                    <div className="brand-grid">
                        {[
                            { name: 'Intel', color: '#0068B5' },
                            { name: 'AMD', color: '#ED1C24' },
                            { name: 'NVIDIA', color: '#76B900' },
                            { name: 'ASUS', color: '#000000' },
                            { name: 'MSI', color: '#CC0000' },
                            { name: 'Gigabyte', color: '#FA6607' },
                            { name: 'Corsair', color: '#111111' },
                            { name: 'Samsung', color: '#034EA2' }
                        ].map((brand) => {
                            const selected = brandPreferences.includes(brand.name);
                            return (
                                <button
                                    type="button"
                                    key={brand.name}
                                    className={`brand-toggle ${selected ? 'selected' : ''}`}
                                    onClick={() => {
                                        const current = brandPreferences ? brandPreferences.split(',').map(s => s.trim()).filter(Boolean) : [];
                                        let newBrands;
                                        if (current.includes(brand.name)) {
                                            newBrands = current.filter(b => b !== brand.name);
                                        } else {
                                            newBrands = [...current, brand.name];
                                        }
                                        setBrandPreferences(newBrands.join(', '));
                                    }}
                                    style={{
                                        '--brand-color': brand.color
                                    } as React.CSSProperties}
                                >
                                    <span className="brand-dot"></span>
                                    {brand.name}
                                </button>
                            );
                        })}
                    </div>
                    <small>{mode === 'beginner' ? 'Select brands you like (optional)' : 'Select your preferred manufacturers (optional)'}</small>
                </div>
            </div>

            {/* Advanced Mode Fields */}
            {mode === 'advanced' && (
                <>
                    <div className="form-section">
                        <div className="section-header">
                            <div className="section-icon">🔌</div>
                            <h3>Power Constraints</h3>
                        </div>
                        <div className="form-row">
                            <div className="form-field">
                                <label htmlFor="powerConstraints">
                                    Maximum Power Draw (Watts)
                                </label>
                                <input
                                    id="powerConstraints"
                                    type="number"
                                    value={powerConstraints}
                                    onChange={(e) => setPowerConstraints(e.target.value)}
                                    placeholder="e.g., 650"
                                    min="0"
                                    step="50"
                                />
                                {errors.powerConstraints && <span className="error">{errors.powerConstraints}</span>}
                            </div>
                            <div className="form-field">
                                <label htmlFor="psuEfficiency">PSU Efficiency Rating</label>
                                <select
                                    id="psuEfficiency"
                                    value={psuEfficiencyRating}
                                    onChange={(e) => setPsuEfficiencyRating(e.target.value)}
                                >
                                    <option value="">Any</option>
                                    <option value="80+ Bronze">80+ Bronze</option>
                                    <option value="80+ Gold">80+ Gold</option>
                                    <option value="80+ Platinum">80+ Platinum</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <div className="section-header">
                            <div className="section-icon">🧠</div>
                            <h3>Memory & Form Factor</h3>
                        </div>
                        <div className="form-row">
                            <div className="form-field">
                                <label htmlFor="ramType">Preferred RAM Type</label>
                                <select
                                    id="ramType"
                                    value={preferredRamType}
                                    onChange={(e) => setPreferredRamType(e.target.value)}
                                >
                                    <option value="">Any</option>
                                    <option value="DDR4">DDR4</option>
                                    <option value="DDR5">DDR5</option>
                                </select>
                            </div>
                            <div className="form-field">
                                <label htmlFor="formFactor">Preferred Form Factor</label>
                                <select
                                    id="formFactor"
                                    value={preferredFormFactor}
                                    onChange={(e) => setPreferredFormFactor(e.target.value)}
                                >
                                    <option value="">Any</option>
                                    <option value="ATX">ATX (Full Size)</option>
                                    <option value="Micro-ATX">Micro-ATX (Compact)</option>
                                    <option value="Mini-ITX">Mini-ITX (Small Form Factor)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <div className="section-header">
                            <div className="section-icon">⚙️</div>
                            <h3>Performance Requirements</h3>
                        </div>
                        <div className="form-row">
                            <div className="form-field">
                                <label htmlFor="minCores">Minimum CPU Cores</label>
                                <select
                                    id="minCores"
                                    value={minimumCores}
                                    onChange={(e) => setMinimumCores(e.target.value)}
                                >
                                    <option value="">Any</option>
                                    <option value="4">4 Cores</option>
                                    <option value="6">6 Cores</option>
                                    <option value="8">8 Cores</option>
                                    <option value="12">12 Cores</option>
                                    <option value="16">16+ Cores</option>
                                </select>
                            </div>
                            <div className="form-field">
                                <label htmlFor="minVRAM">Minimum GPU VRAM</label>
                                <select
                                    id="minVRAM"
                                    value={minimumVRAM}
                                    onChange={(e) => setMinimumVRAM(e.target.value)}
                                >
                                    <option value="">Any</option>
                                    <option value="4">4 GB</option>
                                    <option value="6">6 GB</option>
                                    <option value="8">8 GB</option>
                                    <option value="12">12 GB</option>
                                    <option value="16">16+ GB</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-field checkbox-field">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={requireIntegratedGraphics}
                                    onChange={(e) => setRequireIntegratedGraphics(e.target.checked)}
                                />
                                Require Integrated Graphics (for backup display output)
                            </label>
                        </div>
                    </div>
                </>
            )}

            <div className="form-actions">
                <button type="submit" className="submit-button">
                    {mode === 'beginner' ? 'Start Building' : 'Continue to Component Selection'}
                </button>
            </div>
        </form>
    );
};
