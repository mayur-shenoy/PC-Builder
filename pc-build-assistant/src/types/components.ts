/**
 * Core component type definitions for PC Build Assistant
 * Validates: Requirements 9.1, 9.2, 9.3, 9.4
 */

export type ComponentType = 'CPU' | 'GPU' | 'Motherboard' | 'RAM' | 'Storage' | 'PSU';

export interface Component {
    id: string;
    type: ComponentType;
    name: string;
    manufacturer: string;
    price: number;
    specifications: ComponentSpecifications;
}

export type ComponentSpecifications =
    | CPUSpecifications
    | GPUSpecifications
    | MotherboardSpecifications
    | RAMSpecifications
    | StorageSpecifications
    | PSUSpecifications;

export interface CPUSpecifications {
    socket: string;
    cores: number;
    threads: number;
    baseClock: number;
    boostClock: number;
    tdp: number;
    integratedGraphics: boolean;
    performanceScore: number;
}

export interface GPUSpecifications {
    vram: number;
    powerDraw: number;
    length: number;
    pciSlots: number;
    powerConnectors: string[];
    performanceScore: number;
}

export interface MotherboardSpecifications {
    socket: string;
    formFactor: 'ATX' | 'Micro-ATX' | 'Mini-ITX';
    ramType: 'DDR4' | 'DDR5';
    ramSlots: number;
    maxRamCapacity: number;
    maxRamSpeed: number;
    m2Slots: number;
    sataPorts: number;
    pciSlots: number;
}

export interface RAMSpecifications {
    type: 'DDR4' | 'DDR5';
    speed: number;
    capacity: number;
    modules: number;
    latency: string;
}

export interface StorageSpecifications {
    type: 'M.2 NVMe' | 'M.2 SATA' | 'SATA SSD' | 'SATA HDD';
    capacity: number;
    readSpeed: number;
    writeSpeed: number;
}

export interface PSUSpecifications {
    wattage: number;
    efficiency: '80+ Bronze' | '80+ Silver' | '80+ Gold' | '80+ Platinum' | '80+ Titanium';
    modular: 'Full' | 'Semi' | 'Non';
    connectors: PowerConnectors;
}

export interface PowerConnectors {
    pcie6pin: number;
    pcie8pin: number;
    sata: number;
    molex: number;
}
