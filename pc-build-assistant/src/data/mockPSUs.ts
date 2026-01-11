/**
 * Mock PSU data for PC Build Assistant
 * Requirements: 2.1, 9.3
 */

import { Component, PSUSpecifications } from '../types';

export const mockPSUs: Component[] = [
    {
        id: 'psu-1',
        type: 'PSU',
        name: 'Corsair RM1000x 1000W 80+ Gold',
        manufacturer: 'Corsair',
        price: 189,
        specifications: {
            wattage: 1000,
            efficiency: '80+ Gold',
            modular: 'Full',
            connectors: {
                pcie6pin: 4,
                pcie8pin: 6,
                sata: 12,
                molex: 4,
            },
        } as PSUSpecifications,
    },
    {
        id: 'psu-2',
        type: 'PSU',
        name: 'EVGA SuperNOVA 850 G6 850W 80+ Gold',
        manufacturer: 'EVGA',
        price: 139,
        specifications: {
            wattage: 850,
            efficiency: '80+ Gold',
            modular: 'Full',
            connectors: {
                pcie6pin: 4,
                pcie8pin: 4,
                sata: 10,
                molex: 4,
            },
        } as PSUSpecifications,
    },
    {
        id: 'psu-3',
        type: 'PSU',
        name: 'Seasonic Focus GX-750 750W 80+ Gold',
        manufacturer: 'Seasonic',
        price: 119,
        specifications: {
            wattage: 750,
            efficiency: '80+ Gold',
            modular: 'Full',
            connectors: {
                pcie6pin: 2,
                pcie8pin: 4,
                sata: 9,
                molex: 3,
            },
        } as PSUSpecifications,
    },
    {
        id: 'psu-4',
        type: 'PSU',
        name: 'Thermaltake Toughpower GF1 650W 80+ Gold',
        manufacturer: 'Thermaltake',
        price: 99,
        specifications: {
            wattage: 650,
            efficiency: '80+ Gold',
            modular: 'Full',
            connectors: {
                pcie6pin: 2,
                pcie8pin: 4,
                sata: 8,
                molex: 3,
            },
        } as PSUSpecifications,
    },
    {
        id: 'psu-5',
        type: 'PSU',
        name: 'Cooler Master MWE Gold 650W 80+ Gold',
        manufacturer: 'Cooler Master',
        price: 79,
        specifications: {
            wattage: 650,
            efficiency: '80+ Gold',
            modular: 'Semi',
            connectors: {
                pcie6pin: 2,
                pcie8pin: 2,
                sata: 6,
                molex: 3,
            },
        } as PSUSpecifications,
    },
    {
        id: 'psu-6',
        type: 'PSU',
        name: 'be quiet! Pure Power 11 600W 80+ Gold',
        manufacturer: 'be quiet!',
        price: 89,
        specifications: {
            wattage: 600,
            efficiency: '80+ Gold',
            modular: 'Semi',
            connectors: {
                pcie6pin: 2,
                pcie8pin: 2,
                sata: 6,
                molex: 3,
            },
        } as PSUSpecifications,
    },
    {
        id: 'psu-7',
        type: 'PSU',
        name: 'EVGA 600 BR 600W 80+ Bronze',
        manufacturer: 'EVGA',
        price: 59,
        specifications: {
            wattage: 600,
            efficiency: '80+ Bronze',
            modular: 'Non',
            connectors: {
                pcie6pin: 2,
                pcie8pin: 2,
                sata: 6,
                molex: 3,
            },
        } as PSUSpecifications,
    },
    {
        id: 'psu-8',
        type: 'PSU',
        name: 'Corsair CX550M 550W 80+ Bronze',
        manufacturer: 'Corsair',
        price: 69,
        specifications: {
            wattage: 550,
            efficiency: '80+ Bronze',
            modular: 'Semi',
            connectors: {
                pcie6pin: 2,
                pcie8pin: 2,
                sata: 6,
                molex: 3,
            },
        } as PSUSpecifications,
    },
    {
        id: 'psu-9',
        type: 'PSU',
        name: 'ASUS ROG Thor 1200W 80+ Platinum II',
        manufacturer: 'ASUS',
        price: 329,
        specifications: {
            wattage: 1200,
            efficiency: '80+ Platinum',
            modular: 'Full',
            connectors: {
                pcie6pin: 6,
                pcie8pin: 8,
                sata: 12,
                molex: 6,
            },
        } as PSUSpecifications,
    },
    {
        id: 'psu-10',
        type: 'PSU',
        name: 'MSI MAG A550BN 550W 80+ Bronze',
        manufacturer: 'MSI',
        price: 49,
        specifications: {
            wattage: 550,
            efficiency: '80+ Bronze',
            modular: 'Non',
            connectors: {
                pcie6pin: 2,
                pcie8pin: 2,
                sata: 5,
                molex: 2,
            },
        } as PSUSpecifications,
    },
];
