/**
 * Mock Storage data for PC Build Assistant
 * Requirements: 2.1, 9.2
 */

import { Component, StorageSpecifications } from '../types';

export const mockStorage: Component[] = [
    {
        id: 'storage-1',
        type: 'Storage',
        name: 'Samsung 990 PRO 2TB M.2 NVMe',
        manufacturer: 'Samsung',
        price: 189,
        specifications: {
            type: 'M.2 NVMe',
            capacity: 2000,
            readSpeed: 7450,
            writeSpeed: 6900,
        } as StorageSpecifications,
    },
    {
        id: 'storage-2',
        type: 'Storage',
        name: 'WD Black SN850X 1TB M.2 NVMe',
        manufacturer: 'Western Digital',
        price: 99,
        specifications: {
            type: 'M.2 NVMe',
            capacity: 1000,
            readSpeed: 7300,
            writeSpeed: 6300,
        } as StorageSpecifications,
    },
    {
        id: 'storage-3',
        type: 'Storage',
        name: 'Crucial P3 Plus 500GB M.2 NVMe',
        manufacturer: 'Crucial',
        price: 49,
        specifications: {
            type: 'M.2 NVMe',
            capacity: 500,
            readSpeed: 5000,
            writeSpeed: 3600,
        } as StorageSpecifications,
    },
    {
        id: 'storage-4',
        type: 'Storage',
        name: 'Samsung 870 EVO 1TB SATA SSD',
        manufacturer: 'Samsung',
        price: 89,
        specifications: {
            type: 'SATA SSD',
            capacity: 1000,
            readSpeed: 560,
            writeSpeed: 530,
        } as StorageSpecifications,
    },
    {
        id: 'storage-5',
        type: 'Storage',
        name: 'Crucial MX500 2TB SATA SSD',
        manufacturer: 'Crucial',
        price: 149,
        specifications: {
            type: 'SATA SSD',
            capacity: 2000,
            readSpeed: 560,
            writeSpeed: 510,
        } as StorageSpecifications,
    },
    {
        id: 'storage-6',
        type: 'Storage',
        name: 'WD Blue 4TB SATA HDD',
        manufacturer: 'Western Digital',
        price: 79,
        specifications: {
            type: 'SATA HDD',
            capacity: 4000,
            readSpeed: 150,
            writeSpeed: 150,
        } as StorageSpecifications,
    },
    {
        id: 'storage-7',
        type: 'Storage',
        name: 'Seagate Barracuda 2TB SATA HDD',
        manufacturer: 'Seagate',
        price: 54,
        specifications: {
            type: 'SATA HDD',
            capacity: 2000,
            readSpeed: 160,
            writeSpeed: 160,
        } as StorageSpecifications,
    },
    {
        id: 'storage-8',
        type: 'Storage',
        name: 'Kingston NV2 1TB M.2 NVMe',
        manufacturer: 'Kingston',
        price: 69,
        specifications: {
            type: 'M.2 NVMe',
            capacity: 1000,
            readSpeed: 3500,
            writeSpeed: 2100,
        } as StorageSpecifications,
    },
    {
        id: 'storage-9',
        type: 'Storage',
        name: 'Crucial P3 4TB M.2 NVMe',
        manufacturer: 'Crucial',
        price: 199,
        specifications: {
            type: 'M.2 NVMe',
            capacity: 4000,
            readSpeed: 3500,
            writeSpeed: 3000,
        } as StorageSpecifications,
    },
    {
        id: 'storage-10',
        type: 'Storage',
        name: 'Samsung 870 QVO 4TB SATA SSD',
        manufacturer: 'Samsung',
        price: 219,
        specifications: {
            type: 'SATA SSD',
            capacity: 4000,
            readSpeed: 560,
            writeSpeed: 530,
        } as StorageSpecifications,
    },
];
