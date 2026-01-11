/**
 * Mock RAM data for PC Build Assistant
 * Requirements: 2.1, 9.2
 */

import { Component, RAMSpecifications } from '../types';

export const mockRAM: Component[] = [
    {
        id: 'ram-1',
        type: 'RAM',
        name: 'Corsair Vengeance DDR5 32GB (2x16GB) 6000MHz',
        manufacturer: 'Corsair',
        price: 139,
        specifications: {
            type: 'DDR5',
            speed: 6000,
            capacity: 32,
            modules: 2,
            latency: 'CL30',
        } as RAMSpecifications,
    },
    {
        id: 'ram-2',
        type: 'RAM',
        name: 'G.Skill Trident Z5 DDR5 32GB (2x16GB) 6400MHz',
        manufacturer: 'G.Skill',
        price: 169,
        specifications: {
            type: 'DDR5',
            speed: 6400,
            capacity: 32,
            modules: 2,
            latency: 'CL32',
        } as RAMSpecifications,
    },
    {
        id: 'ram-3',
        type: 'RAM',
        name: 'Kingston FURY Beast DDR5 16GB (2x8GB) 5200MHz',
        manufacturer: 'Kingston',
        price: 79,
        specifications: {
            type: 'DDR5',
            speed: 5200,
            capacity: 16,
            modules: 2,
            latency: 'CL36',
        } as RAMSpecifications,
    },
    {
        id: 'ram-4',
        type: 'RAM',
        name: 'Corsair Vengeance LPX DDR4 32GB (2x16GB) 3600MHz',
        manufacturer: 'Corsair',
        price: 89,
        specifications: {
            type: 'DDR4',
            speed: 3600,
            capacity: 32,
            modules: 2,
            latency: 'CL18',
        } as RAMSpecifications,
    },
    {
        id: 'ram-5',
        type: 'RAM',
        name: 'G.Skill Ripjaws V DDR4 32GB (2x16GB) 3200MHz',
        manufacturer: 'G.Skill',
        price: 79,
        specifications: {
            type: 'DDR4',
            speed: 3200,
            capacity: 32,
            modules: 2,
            latency: 'CL16',
        } as RAMSpecifications,
    },
    {
        id: 'ram-6',
        type: 'RAM',
        name: 'Crucial Ballistix DDR4 16GB (2x8GB) 3200MHz',
        manufacturer: 'Crucial',
        price: 54,
        specifications: {
            type: 'DDR4',
            speed: 3200,
            capacity: 16,
            modules: 2,
            latency: 'CL16',
        } as RAMSpecifications,
    },
    {
        id: 'ram-7',
        type: 'RAM',
        name: 'TeamGroup T-Force Delta RGB DDR4 16GB (2x8GB) 3600MHz',
        manufacturer: 'TeamGroup',
        price: 64,
        specifications: {
            type: 'DDR4',
            speed: 3600,
            capacity: 16,
            modules: 2,
            latency: 'CL18',
        } as RAMSpecifications,
    },
    {
        id: 'ram-8',
        type: 'RAM',
        name: 'Kingston FURY Beast DDR4 64GB (2x32GB) 3600MHz',
        manufacturer: 'Kingston',
        price: 179,
        specifications: {
            type: 'DDR4',
            speed: 3600,
            capacity: 64,
            modules: 2,
            latency: 'CL18',
        } as RAMSpecifications,
    },
    {
        id: 'ram-9',
        type: 'RAM',
        name: 'Corsair Vengeance RGB DDR5 64GB (2x32GB) 6000MHz',
        manufacturer: 'Corsair',
        price: 219,
        specifications: {
            type: 'DDR5',
            speed: 6000,
            capacity: 64,
            modules: 2,
            latency: 'CL30',
        } as RAMSpecifications,
    },
    {
        id: 'ram-10',
        type: 'RAM',
        name: 'TeamGroup T-Force Vulcan Z 16GB (2x8GB) 3200MHz',
        manufacturer: 'TeamGroup',
        price: 35,
        specifications: {
            type: 'DDR4',
            speed: 3200,
            capacity: 16,
            modules: 2,
            latency: 'CL16',
        } as RAMSpecifications,
    },
];
