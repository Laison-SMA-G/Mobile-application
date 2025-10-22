import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Platform,
  Image,
  Switch
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useCart } from '../context/CartContext';
import Item from '../data/Item.json';

// --- COMPONENT & DATA STRUCTURE ---
const componentStructure = [
    // All 'required' properties are set to false for maximum customization freedom.
    { id: 'cpu', name: 'Processor (CPU)', type: 'Processor', required: false, icon: 'chip' },
    { id: 'motherboard', name: 'Motherboard', type: 'Motherboard', required: false, icon: 'server' },
    { id: 'memory', name: 'Memory (RAM)', type: 'Memory (RAM)', required: false, icon: 'memory' },
    { id: 'ssd_sata', name: 'SSD (SATA)', type: 'SSD', subType: 'SATA', required: false, icon: 'harddisk' },
    { id: 'ssd_m2', name: 'SSD (M.2)', type: 'SSD', subType: 'M.2', required: false, icon: 'harddisk' },
    { id: 'hdd', name: 'HDD', type: 'HDD', required: false, icon: 'harddisk' },
    { id: 'gpu', name: 'Graphics Card (GPU)', type: 'Graphics Card', required: false, icon: 'gamepad-variant' },
    { id: 'pccase', name: 'PC Case', type: 'PC Case', required: false, icon: 'package-variant-closed' },
    { id: 'psu', name: 'Power Supply (PSU)', type: 'Power Supply', required: false, icon: 'power-plug' },
    { id: 'cpu_cooler', name: 'CPU Cooler', type: 'CPU Cooling', required: false, icon: 'fan' }
];

// --- UTILITY & COMPATIBILITY LOGIC ---
const getAttribute = (product, keywords) => {
    if (!product) return null;
    const text = `${product.name} ${product.description}`.toLowerCase();
    for (const keyword of keywords) { if (text.includes(keyword.toLowerCase())) return keyword; }
    return null;
};
const getCpuSocket = (product) => getAttribute(product, ['AM4', 'AM5', 'LGA 1700']);
const getRamType = (product) => getAttribute(product, ['DDR4', 'DDR5']);
const getRamFormFactor = (product) => getAttribute(product, ['SODIMM']);
const getMoboFormFactor = (product) => getAttribute(product, ['Micro-ATX', 'Micro ATX', 'Mini-ITX', 'ATX', 'E-ATX']); // Added more form factors
const getStorageType = (product) => {
    if (!product) return null;
    const text = `${product.name} ${product.description}`.toLowerCase();

    if (text.includes('m.2') || text.includes('nvme')) {
        return 'M.2';
    }
    if (text.includes('sata')) {
        return 'SATA';
    }
    if (product.type === 'HDD') {
        return 'SATA'; // HDDs are generally SATA
    }
    // Default SSDs without explicit M.2/NVMe/SATA mention to SATA
    if (product.type === 'SSD') {
        return 'SATA';
    }

    return null;
};

// New utility for checking integrated graphics
const hasIntegratedGraphics = (cpu) => {
    if (!cpu) return false;
    const cpuName = cpu.name.toLowerCase();
    // Common patterns for CPUs with integrated graphics
    // Intel: often F-series do NOT have integrated graphics (e.g., 12600KF)
    // AMD: G-series or Ryzen CPUs with "Radeon Graphics" in name/description (e.g., Ryzen 5 5600G)
    if (cpuName.includes('intel') && cpuName.includes('f')) {
        return false; // Intel F-series typically don't have iGPU
    }
    if (cpuName.includes('ryzen') && cpuName.includes('g')) {
        return true; // AMD G-series typically have iGPU
    }
    // More general check for Intel (if not F-series, assume has iGPU unless specified)
    if (cpuName.includes('intel')) {
        return true; // Assume Intel CPUs (non-F) have iGPU
    }
    // More general check for AMD (look for 'graphics' in description)
    if (cpuName.includes('ryzen') && cpu.description.toLowerCase().includes('radeon graphics')) {
        return true;
    }
    // This can be expanded with a more comprehensive database of CPUs
    return false;
};

// --- Currency Formatting Utility ---
const formatPrice = (value) => {
  const num = parseFloat(value);

  // Check if integer or may decimal
  if (Number.isInteger(num)) {
    return `₱${num.toLocaleString()}`;
  } else {
    return `₱${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
};


const Builder = () => {
    const navigation = useNavigation();
    const { itemCount } = useCart();
    const { addToCart } = useCart();
    const [allProducts, setAllProducts] = useState([]);
    const [selectedComponents, setSelectedComponents] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isModalVisible, setModalVisible] = useState(false);
    const [currentSlot, setCurrentSlot] = useState(null);
    const [showOnlyCompatible, setShowOnlyCompatible] = useState(true);
    
    const [isErrorModalVisible, setErrorModalVisible] = useState(false);
    const [errorConfig, setErrorConfig] = useState({ title: '', message: '' });

    const [isConfirmModalVisible, setConfirmModalVisible] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState({ title: '', message: '', onConfirm: () => {} });

    // === NA-UPDATE NA STATES PARA SA PLAIN SUCCESS TOAST ===
    const [isSuccessModalVisible, setSuccessModalVisible] = useState(false);
    const [successConfig, setSuccessConfig] = useState({ message: '' });

    const [fontsLoaded] = useFonts({
      'Rubik-Regular': require('../assets/fonts/Rubik/static/Rubik-Regular.ttf'),
      'Rubik-Medium': require('../assets/fonts/Rubik/static/Rubik-Medium.ttf'),
      'Rubik-Bold': require('../assets/fonts/Rubik/static/Rubik-Bold.ttf'),
      'Rubik-SemiBold': require('../assets/fonts/Rubik/static/Rubik-SemiBold.ttf'),
    });

    useEffect(() => {
        setAllProducts(Item);
        setIsLoading(false);
    }, []);
    
    // === BAGONG HELPER FUNCTION PARA SA SUCCESS TOAST ===
    const showSuccessToast = (message) => {
        setSuccessConfig({ message });
        setSuccessModalVisible(true);
        setTimeout(() => {
            setSuccessModalVisible(false);
        }, 2000); // Awtomatikong mawawala pagkatapos ng 2 segundo
    };

    // --- Updated getCompatibilityInfo Function ---
    const getCompatibilityInfo = (product, productType, currentSlotId, currentSelection) => {
        const { cpu, motherboard, pccase, gpu } = currentSelection;
        const issues = [];

        // Universal check: Product already selected in another slot (prevent duplicates, except RAM)
        // This is a basic check. For some components like RAM, multiple are allowed.
        // You might want a more sophisticated check if specific limits exist (e.g., only one CPU).
        // For now, let's allow multiple RAM but restrict other major components.
        const isDuplicate = Object.values(currentSelection).some(
            (selectedItem) => selectedItem && selectedItem.id === product.id && currentSlotId !== 'memory'
        );
        if (isDuplicate) {
             issues.push('This item is already in your build.');
        }


        // Motherboard compatibility with CPU
        if (productType === 'Motherboard' && cpu) {
            const cpuSocket = getCpuSocket(cpu);
            const moboSocket = getCpuSocket(product);
            if (cpuSocket && moboSocket && cpuSocket !== moboSocket) {
                issues.push(`Socket Mismatch: Requires ${cpuSocket}`);
            }
        }
        // Processor compatibility with Motherboard
        if (productType === 'Processor' && motherboard) {
            const moboSocket = getCpuSocket(motherboard);
            const cpuSocket = getCpuSocket(product);
            if (moboSocket && cpuSocket && moboSocket !== cpuSocket) {
                issues.push(`Socket Mismatch: Requires ${moboSocket}`);
            }
        }
        // Memory (RAM) compatibility with Motherboard
        if (productType === 'Memory (RAM)' && motherboard) {
            const moboRamType = getRamType(motherboard);
            const memRamType = getRamType(product);
            if (moboRamType && memRamType && moboRamType !== memRamType) {
                issues.push(`RAM Type Mismatch: Requires ${moboRamType}`);
            }
            if (getRamFormFactor(product) === 'SODIMM') {
                issues.push('SODIMM RAM is for laptops, not desktops.');
            }
        }
        // PC Case compatibility with Motherboard
        if (productType === 'PC Case' && motherboard) {
            const moboFormFactor = getMoboFormFactor(motherboard);
            const caseDescription = product.description.toLowerCase();
            // This is a simplified check. Real cases specify supported form factors.
            // You might need to parse supported form factors from case description/name or add a 'supportedFormFactors' attribute to your case data.
            // For example, if mobo is Micro-ATX, and case only supports Mini-ITX, that's an issue.
            // If the case supports ATX, it generally supports Micro-ATX and Mini-ITX too.
            if (moboFormFactor === 'Micro-ATX' && !(caseDescription.includes('micro atx') || caseDescription.includes('m-atx') || caseDescription.includes('atx'))) {
                issues.push(`Motherboard Form Factor Mismatch: Case may not explicitly support ${moboFormFactor}.`);
            } else if (moboFormFactor === 'ATX' && !caseDescription.includes('atx')) {
                 issues.push(`Motherboard Form Factor Mismatch: Case may not support ${moboFormFactor}.`);
            }
            // Add other form factors if necessary (Mini-ITX, E-ATX)
        }
        // CPU Cooler compatibility with CPU (basic check)
        if (productType === 'CPU Cooling' && cpu) {
            const cpuSocket = getCpuSocket(cpu);
            const coolerDescription = product.description.toLowerCase();
            // More specific cooler checks
            if (cpuSocket === 'AM5' && (coolerDescription.includes('wraith stealth') || coolerDescription.includes('stock cooler'))) {
                 issues.push(`Cooling Warning: ${product.name} may be insufficient for high-performance AM5 CPUs. Consider an aftermarket cooler.`);
            }
            if (cpuSocket === 'AM4' && cpu.name.toLowerCase().includes('ryzen 7') && (coolerDescription.includes('wraith stealth') || coolerDescription.includes('stock cooler'))) {
                issues.push(`Cooling Warning: ${product.name} may be insufficient for high-performance AM4 Ryzen 7/9 CPUs.`);
            }
            // Generic socket compatibility check
            if (cpuSocket && !(coolerDescription.includes(cpuSocket.toLowerCase().replace(/\s/g, '')) || coolerDescription.includes('lga') || coolerDescription.includes('amd'))) {
                 issues.push(`Socket Compatibility: Cooler may not explicitly support ${cpuSocket}.`);
            }
            // Basic size check (e.g., AIO vs SFF case) - more advanced for later
        }

        // Storage specific checks for the MODAL when choosing a component
        if (productType === 'SSD') {
            const currentProductStorageType = getStorageType(product);
            if (currentSlotId === 'ssd_sata' && currentProductStorageType !== 'SATA') {
                issues.push(`This slot requires a SATA SSD. This is an ${currentProductStorageType} SSD.`);
            } else if (currentSlotId === 'ssd_m2' && currentProductStorageType !== 'M.2') {
                issues.push(`This slot requires an M.2 SSD. This is a ${currentProductStorageType} SSD.`);
            }
        } else if (productType === 'HDD') {
            // For HDD slot, ensure it's indeed an HDD and not some other storage type accidentally
            if (product.type !== 'HDD' || getStorageType(product) !== 'SATA') {
                 issues.push(`This slot requires a SATA HDD. This is a ${product.type || 'unknown'} (${getStorageType(product) || 'unknown'}) drive.`);
            }
        }

        // PSU Wattage (basic check, can be greatly expanded)
        if (productType === 'Power Supply') {
            const estimatedWattage = 300; // A very basic placeholder. In reality, calculate based on CPU, GPU etc.
            const psuWattageMatch = product.name.match(/(\d{3,4})\s*w/i); // e.g., "650W"
            const psuWattage = psuWattageMatch ? parseInt(psuWattageMatch[1]) : 0;
            if (psuWattage > 0 && psuWattage < estimatedWattage) {
                 issues.push(`Power Warning: ${product.name} (${psuWattage}W) might be too low for a typical build (est. ${estimatedWattage}W).`);
            }
        }


        return { compatible: issues.length === 0, reason: issues.join('; ') };
    };

    // --- Updated compatibilityResult useMemo Hook ---
    const compatibilityResult = useMemo(() => {
        const issues = [];
        const { cpu, motherboard, memory, pccase, cpu_cooler, ssd_sata, ssd_m2, hdd, psu, gpu } = selectedComponents;

        // Core component presence checks (only flag if related components are present)
        if (motherboard && !cpu) issues.push('A Processor is needed for the Motherboard.');
        if (cpu && !motherboard) issues.push('A Motherboard is needed to connect the Processor.');
        if (motherboard && !memory) issues.push('Memory (RAM) is usually required for a functional system with a Motherboard.');
        if (motherboard && !pccase) issues.push('A PC Case is typically needed to house the Motherboard.');
        if (motherboard && !psu) issues.push('A Power Supply Unit (PSU) is essential to power the Motherboard and other components.');

        // CPU & Motherboard Compatibility
        if (cpu && motherboard) {
            const cpuSocket = getCpuSocket(cpu);
            const moboSocket = getCpuSocket(motherboard);
            if (cpuSocket && moboSocket && cpuSocket !== moboSocket) {
                issues.push(`Socket Mismatch: CPU (${cpuSocket}) vs Motherboard (${moboSocket}).`);
            }
            const moboRamType = getRamType(motherboard); // Motherboard's RAM type
            if (!moboRamType) {
                 issues.push('Motherboard RAM type could not be determined.');
            }
        }

        // Memory & Motherboard Compatibility
        if (memory && motherboard) {
            const memType = getRamType(memory);
            const moboMemType = getRamType(motherboard);
            if (memType && moboMemType && memType !== moboMemType) {
                issues.push(`RAM Mismatch: Memory (${memType}) vs Motherboard (${moboMemType}).`);
            }
            if (getRamFormFactor(memory) === 'SODIMM') {
                issues.push(`Form Factor Warning: SODIMM RAM is for laptops, not desktops.`);
            }
        } else if (memory && !motherboard) {
            issues.push('Memory (RAM) needs a Motherboard to be compatible with.');
        }

        // PC Case & Motherboard Compatibility
        if (pccase && motherboard) {
            const moboFormFactor = getMoboFormFactor(motherboard);
            const caseDescription = pccase.description.toLowerCase();
            // A more robust check. You'd ideally have 'supportedFormFactors' in your case data.
            // For simplicity, check if mobo form factor is mentioned or implied in case description.
            let caseSupportsMobo = false;
            if (moboFormFactor === 'Mini-ITX' && (caseDescription.includes('mini-itx') || caseDescription.includes('itx'))) caseSupportsMobo = true;
            else if (moboFormFactor === 'Micro-ATX' && (caseDescription.includes('micro-atx') || caseDescription.includes('m-atx') || caseDescription.includes('atx'))) caseSupportsMobo = true;
            else if (moboFormFactor === 'ATX' && caseDescription.includes('atx')) caseSupportsMobo = true;
            // Add checks for E-ATX if your data includes them

            if (moboFormFactor && !caseSupportsMobo) {
                issues.push(`Fit Warning: Motherboard (${moboFormFactor}) may not fit in Case (${pccase.name}).`);
            }
        } else if (pccase && !motherboard) {
            issues.push('A PC Case needs a Motherboard to determine compatibility.');
        }

        // CPU Cooler & CPU Compatibility
        if (cpu_cooler && cpu) {
            const cpuSocket = getCpuSocket(cpu);
            const coolerDescription = cpu_cooler.description.toLowerCase();
            if (cpuSocket === 'AM5' && (coolerDescription.includes('wraith stealth') || coolerDescription.includes('stock cooler'))) {
                issues.push(`Cooling Warning: ${cpu_cooler.name} may be insufficient for high-performance ${cpu.name}.`);
            }
             if (cpuSocket && !(coolerDescription.includes(cpuSocket.toLowerCase().replace(/\s/g, '')) || coolerDescription.includes('lga') || coolerDescription.includes('amd'))) {
                 issues.push(`Socket Compatibility: Cooler (${cpu_cooler.name}) may not explicitly support ${cpuSocket}.`);
            }
        } else if (cpu_cooler && !cpu) {
            issues.push('A CPU Cooler needs a Processor to determine compatibility.');
        }

        // Storage checks (at least one *bootable* storage is often desired for a complete PC)
        const hasAnyBootableStorage = (ssd_sata && getStorageType(ssd_sata) === 'SATA') || (ssd_m2 && getStorageType(ssd_m2) === 'M.2');
        
        // Only suggest storage if there's a CPU and Motherboard
        if (cpu && motherboard && !hasAnyBootableStorage) {
            issues.push('At least one bootable storage device (SATA SSD/HDD or M.2 SSD) is usually needed for a functional PC.');
        }

        // Specific storage slot type mismatches (when items are selected in the build)
        if (ssd_sata && getStorageType(ssd_sata) !== 'SATA') {
            issues.push(`SSD (SATA) slot has an incompatible drive type: ${getStorageType(ssd_sata)} SSD.`);
        }
        if (ssd_m2 && getStorageType(ssd_m2) !== 'M.2') {
            issues.push(`SSD (M.2) slot has an incompatible drive type: ${getStorageType(ssd_m2)} SSD.`);
        }
        if (hdd && getStorageType(hdd) !== 'SATA') {
            issues.push(`HDD slot has an incompatible drive type: ${getStorageType(hdd)} (expected SATA HDD).`);
        } else if (hdd && hdd.type !== 'HDD') { // Ensure the item is actually an HDD
            issues.push(`HDD slot has a non-HDD item: ${hdd.name}.`);
        }

        // GPU / Integrated Graphics check
        if (cpu && !gpu && !hasIntegratedGraphics(cpu)) {
            issues.push(`Display Warning: The selected CPU (${cpu.name}) likely does not have integrated graphics. A Graphics Card (GPU) is required for display output.`);
        }


        // PSU Wattage (more robust calculation needed for a real app, this is a placeholder)
        if (psu && cpu && (gpu || hasIntegratedGraphics(cpu))) { // Only check if CPU and some form of graphics exists
            let estimatedBuildWattage = 100; // Base for Motherboard, RAM, etc.
            if (cpu) estimatedBuildWattage += 65; // Placeholder for CPU
            if (gpu) estimatedBuildWattage += 150; // Placeholder for GPU
            // Add more for storage, fans, etc.
            
            const psuWattageMatch = psu.name.match(/(\d{3,4})\s*w/i);
            const psuWattage = psuWattageMatch ? parseInt(psuWattageMatch[1]) : 0;

            // Give some headroom, e.g., 20%
            if (psuWattage > 0 && psuWattage < (estimatedBuildWattage * 1.2)) {
                 issues.push(`Power Warning: PSU (${psuWattage}W) might be undersized for this build (estimated need ~${Math.ceil(estimatedBuildWattage * 1.2)}W).`);
            }
        } else if (!psu && (cpu || motherboard)) { // If core components are there but no PSU
             issues.push('A Power Supply Unit (PSU) is required to power the system.');
        }


        // Determine overall status
        const isEmptyBuild = Object.keys(selectedComponents).length === 0;

        if (isEmptyBuild) {
            return { compatible: false, status: 'empty', message: 'Start by adding components to your build.', details: [] };
        } else if (issues.length > 0) {
            return { compatible: false, status: 'issues', message: 'Potential Compatibility Issues Found or Incomplete Build', details: issues };
        } else {
            return { compatible: true, status: 'compatible', message: 'Your build looks good!', details: [] };
        }
    }, [selectedComponents]);

    const totalPrice = useMemo(() => Object.values(selectedComponents).reduce((total, product) => total + parseFloat(product.price), 0), [selectedComponents]);

    const handleChoosePress = (slot) => { setCurrentSlot(slot); setModalVisible(true); };
    const handleSelectComponent = (product) => { setSelectedComponents(prev => ({ ...prev, [currentSlot.id]: product })); setModalVisible(false); setCurrentSlot(null); };
    const handleRemoveComponent = (slotId) => { setSelectedComponents(prev => { const newSelection = { ...prev }; delete newSelection[slotId]; return newSelection; }); };

    /**
     * =======================================================
     * === NA-UPDATE NA HANDLERS GAMIT ANG PLAIN TOAST ===
     * =======================================================
     */
    const handleClearBuild = () => {
        setConfirmConfig({
            title: "Clear Build",
            message: "Are you sure you want to clear the entire build?",
            onConfirm: () => {
                setSelectedComponents({});
                showSuccessToast("Build Cleared Successfully"); // Gamitin ang toast
            }
        });
        setConfirmModalVisible(true);
    };

    const handleAddToCart = () => {
        if (!compatibilityResult.compatible) {
            setErrorConfig({
                title: "Cannot Add to Cart",
                message: "Your build has compatibility issues or is incomplete. Please resolve them before proceeding."
            });
            setErrorModalVisible(true);
            return;
        }

        const buildItems = Object.values(selectedComponents);
        if (buildItems.length === 0) {
             setErrorConfig({
                title: "Cannot Add to Cart",
                message: "Your build is empty. Please add components before adding to cart."
            });
            setErrorModalVisible(true);
            return;
        }
        buildItems.forEach(item => addToCart(item));
        
        showSuccessToast("Build Added to Cart!"); // Gamitin ang toast
    };

    const handleSaveBuild = () => {
        if (!compatibilityResult.compatible && Object.keys(selectedComponents).length > 0) { // Allow saving incomplete but not incompatible builds
            setErrorConfig({
                title: "Cannot Save Build",
                message: "Your build has compatibility issues. Please resolve them before saving."
            });
            setErrorModalVisible(true);
            return;
        }
        if (Object.keys(selectedComponents).length === 0) {
            setErrorConfig({
                title: "Cannot Save Empty Build",
                message: "Your build is empty. Please add components before saving."
            });
            setErrorModalVisible(true);
            return;
        }
        // In a real application, you would save `selectedComponents` to a database or local storage.
        // For this example, we'll just show a success toast.
        console.log("Saving build:", selectedComponents);
        // Mock saving to a global/local variable for demonstration
        global._savedBuild = selectedComponents; 
        showSuccessToast("Build Saved Successfully!");
    };

    const handleLoadBuild = () => {
        // In a real application, you would load `selectedComponents` from a database or local storage.
        // For this example, we'll use a mock saved build.
        if (!global._savedBuild || Object.keys(global._savedBuild).length === 0) {
            setErrorConfig({
                title: "No Saved Build",
                message: "There is no saved build to load."
            });
            setErrorModalVisible(true);
            return;
        }

        setConfirmConfig({
            title: "Load Saved Build",
            message: "Loading a saved build will replace your current build. Are you sure you want to proceed?",
            onConfirm: () => {
                setSelectedComponents(global._savedBuild);
                showSuccessToast("Build Loaded Successfully!");
            }
        });
        setConfirmModalVisible(true);
    };


    const renderStatus = () => {
        const { status, message, details } = compatibilityResult;
        let style = styles.statusInfo, icon = 'information', color = '#3b82f6';
        if (status === 'compatible') { style = styles.statusSuccess; icon = 'check-circle'; color = '#22c55e'; }
        else if (status === 'issues') { style = styles.statusWarning; icon = 'alert-circle'; color = '#f97316'; }
        else if (status === 'empty') { style = styles.statusInfo; icon = 'information'; color = '#3b82f6'; } // New status for empty build
        
        return (
            <View style={style}>
                <View style={styles.statusHeader}><Icon name={icon} size={18} color={color} style={{ marginRight: 8 }} /><Text style={styles.statusMessage}>{message}</Text></View>
                {details.length > 0 && (<View style={styles.statusDetailsContainer}>{details.map((issue, index) => <Text key={index} style={styles.statusDetailItem}>• {issue}</Text>)}</View>)}
            </View>
        );
    };

        const renderModalProductList = () => {
        let availableProducts = allProducts.filter(p => p.type === currentSlot?.type);
        
        // --- Refined filtering by subType for SSD and HDD ---
        if (currentSlot?.id === 'ssd_sata') {
            availableProducts = availableProducts.filter(p => getStorageType(p) === 'SATA');
        } else if (currentSlot?.id === 'ssd_m2') {
            availableProducts = availableProducts.filter(p => getStorageType(p) === 'M.2');
        } else if (currentSlot?.id === 'hdd') {
            // Ensure it's an actual HDD type and detected as SATA
            availableProducts = availableProducts.filter(p => p.type === 'HDD' && getStorageType(p) === 'SATA');
        }

        // --- NEW: Filter out products with 0 stock ---
        availableProducts = availableProducts.filter(p => p.stock > 0);


        if (availableProducts.length === 0) return <Text style={styles.noPartsText}>No parts available for this category.</Text>;
        
        const filteredProducts = showOnlyCompatible ? availableProducts.filter(p => getCompatibilityInfo(p, currentSlot?.type, currentSlot?.id, selectedComponents).compatible) : availableProducts;
        
        if (filteredProducts.length === 0) return <Text style={styles.noPartsText}>No compatible parts found for your current selection.</Text>;
        
        return (
            <FlatList
                data={filteredProducts} keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => {
                    const { compatible, reason } = getCompatibilityInfo(item, currentSlot.type, currentSlot.id, selectedComponents);
                    return (
                        <TouchableOpacity style={[styles.productItem, !compatible && styles.incompatibleItem]} onPress={() => handleSelectComponent(item)} disabled={!compatible}>
                            {item.images && item.images.length > 0 && <Image source={{ uri: item.images[0] }} style={styles.productImageModal} />}
                            <View style={styles.productInfo}>
                                <Text style={styles.productName}>{item.name}</Text>
                                {!compatible && <Text style={styles.compatibilityWarningText}><Icon name="alert-circle" size={12} /> Incompatible: {reason}</Text>}
                                <Text style={styles.productRating}>Rating: {item.rate}/5 ({item.review} reviews)</Text>
                            </View>
                            <View style={styles.productAction}>
                                <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
                                {/* You might want to add an "Out of Stock" indicator here if stock can be 0 but still shown */}
                            </View>
                        </TouchableOpacity>
                    );
                }} ItemSeparatorComponent={() => <View style={styles.separator} />} />
        );
    };

    if (!fontsLoaded || isLoading) {
        return ( <View style={styles.centered}><ActivityIndicator size="large" color="#074ec2" /></View> );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
          
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}><Icon name="chevron-left" size={30} color="#FFFFFF" /></TouchableOpacity>
                <Text style={styles.headerTitle}>PC Part Builder</Text>
               
                <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
                            <View>
                                <Icon name="cart-outline" size={28} color={'#FFFFFF'}  />
                                {itemCount > 0 && (
                                  <View style={styles.badgeContainer}>
                                    <Text style={styles.badgeText}>{itemCount}</Text>
                                  </View>
                                )}
                            </View>
                </TouchableOpacity>
            </View>
            <ScrollView style={styles.container}>
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Build Summary</Text>
                    {renderStatus()}
                     <View style={styles.priceContainer}><Text style={styles.priceLabel}>Total Price:</Text><Text style={styles.priceValue}>{formatPrice(totalPrice)}</Text></View>
                    <View style={styles.actionButtonsRow}>
                        <TouchableOpacity 
                            style={[styles.miniActionButton, !compatibilityResult.compatible && styles.disabledButton]} 
                            onPress={handleAddToCart} 
                            disabled={!compatibilityResult.compatible || Object.keys(selectedComponents).length === 0}
                        >
                            <Icon name="cart-plus" size={24} color="#FFFFFF" />
                            <Text style={styles.miniActionButtonText}>Add to Cart</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.miniActionButton, styles.saveButton, !compatibilityResult.compatible && styles.disabledButton]} 
                            onPress={handleSaveBuild} 
                            disabled={!compatibilityResult.compatible && Object.keys(selectedComponents).length > 0} // Allow saving if not compatible but not empty
                        >
                            <Icon name="content-save-outline" size={24} color="#FFFFFF" />
                            <Text style={styles.miniActionButtonText}>Save Build</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.miniActionButton, styles.loadButton]} 
                            onPress={handleLoadBuild}
                        >
                            <Icon name="folder-upload-outline" size={24} color="#FFFFFF" />
                            <Text style={styles.miniActionButtonText}>Load Build</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.miniActionButton, styles.clearButton]} onPress={handleClearBuild}>
                            <Icon name="trash-can-outline" size={24} color="#FFFFFF" />
                            <Text style={styles.miniActionButtonText}>Clear Build</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={[styles.card, { marginBottom: 40 }]}>
                    <Text style={styles.cardTitle}>Choose Your Components</Text>
                    {componentStructure.map(slot => {
                        const product = selectedComponents[slot.id];
                        // Removed `isRequired` check from here, as all are optional now.
                        return (
                            <View key={slot.id} style={styles.slotContainer}>
                                {product ? (
                                    <>
                                        {product.images && product.images.length > 0 ? (
                                            <Image source={{ uri: product.images[0] }} style={styles.slotImage} />
                                        ) : (
                                            <View style={[styles.slotImage, styles.noImageIcon]}>
                                                <Icon name={slot.icon} size={30} color="#94a3b8" />
                                            </View>
                                        )}
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.slotProduct} numberOfLines={1}>{product.name}</Text>
                                            <Text style={styles.slotName}>{slot.name}</Text>
                                            
                                        </View>
                                        <View style={{ alignItems: 'flex-end' }}>
                                            <Text style={styles.slotPrice}>{formatPrice(product.price)}</Text>
                                            <TouchableOpacity onPress={() => handleRemoveComponent(slot.id)}>
                                                <Text style={styles.changeButtonText}>Change</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </>
                                ) : (
                                    <>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Icon name={slot.icon} size={24} color="#64748b" style={styles.slotIcon} />
                                            <Text style={styles.slotNameUnselected}>{slot.name}</Text>
                                            {/* Removed requiredTextIndicator here */}
                                        </View>
                                        <TouchableOpacity style={styles.chooseButton} onPress={() => handleChoosePress(slot)}>
                                            <Text style={styles.chooseButtonText}>Choose</Text>
                                            <Icon name="chevron-right" size={16} color="#FFFFFF" />
                                        </TouchableOpacity>
                                    </>
                                )}
                            </View>
                        );
                    })}
                </View>
            </ScrollView>
            <Modal animationType="slide" visible={isModalVisible} onRequestClose={() => setModalVisible(false)} >
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}><Text style={styles.modalTitle}>Select a {currentSlot?.name}</Text><TouchableOpacity onPress={() => setModalVisible(false)}><Icon name="close" size={24} color="#64748b" /></TouchableOpacity></View>
                    <View style={styles.toggleContainer}><Text style={styles.toggleLabel}>Show only compatible parts</Text><Switch trackColor={{ false: "#767577", true: "#074fc298" }} thumbColor={showOnlyCompatible ? "#074ec2" : "#f4f3f4"} ios_backgroundColor="#3e3e3e" onValueChange={() => setShowOnlyCompatible(previousState => !previousState)} value={showOnlyCompatible} /></View>
                    {renderModalProductList()}
                </SafeAreaView>
            </Modal>
            
            <Modal transparent={true} visible={isErrorModalVisible} onRequestClose={() => setErrorModalVisible(false)}>
                <Pressable style={styles.modalOverlay} onPress={() => setErrorModalVisible(false)}>
                    <Pressable style={styles.alertModalContainer}>
                        
                        <Text style={styles.alertModalTitle}>{errorConfig.title}</Text>
                        <Text style={styles.alertModalMessage}>{errorConfig.message}</Text>
                        <TouchableOpacity style={[styles.alertModalButton, {backgroundColor: '#f97316'}]} onPress={() => setErrorModalVisible(false)}>
                            <Text style={styles.alertModalButtonText}>OK</Text>
                        </TouchableOpacity>
                    </Pressable>
                </Pressable>
            </Modal>
            <Modal transparent={true} visible={isConfirmModalVisible} onRequestClose={() => setConfirmModalVisible(false)}>
                <Pressable style={styles.modalOverlay} onPress={() => setConfirmModalVisible(false)}>
                    <Pressable style={styles.alertModalContainer}>
                        
                        <Text style={styles.alertModalTitle}>{confirmConfig.title}</Text>
                        <Text style={styles.alertModalMessage}>{confirmConfig.message}</Text>
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={[styles.modalButton, styles.modalSecondaryButton]} onPress={() => setConfirmModalVisible(false)}>
                                <Text style={styles.modalButtonTextSecondary}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalButton, styles.modalPrimaryButton]} onPress={() => { confirmConfig.onConfirm(); setConfirmModalVisible(false); }}>
                                <Text style={styles.modalButtonTextPrimary}>Yes</Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* === NA-UPDATE NA SUCCESS MODAL (TOAST) === */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={isSuccessModalVisible}
            >
                <View style={styles.toastOverlay}>
                    <View style={styles.toastContainer}>
                        <Text style={styles.toastText}>{successConfig.message}</Text>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};


// --- STYLES (with new toast styles added) ---
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#FFFFFF', paddingBottom: Platform.OS === 'ios' ? 80 : 30 },
    container: { flex: 1, backgroundColor: '#FAFAFA' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F4F8' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#074ec2' },
    headerTitle: { fontSize: 20,  justifyContent: 'center', aligItems: 'center', fontFamily: 'Rubik-Medium', color: "#FFFFFF" },
    headerIcon: {
    marginLeft: 4
  },
  badgeContainer: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: '#EE2323',
    borderRadius: 9,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
     },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
    card: {  padding: 12, marginHorizontal: 10, marginTop: 16, },
    cardTitle: { fontSize: 20, fontFamily: 'Rubik-SemiBold', color: '#1C1C1C', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 8 },
    statusInfo: { backgroundColor: '#eff6ff', padding: 12, borderRadius: 15, marginBottom: 12 },
    statusSuccess: { backgroundColor: '#f0fdf4', padding: 12, borderRadius: 15, marginBottom: 12 },
    statusWarning: { backgroundColor: '#fff7ed', padding: 12, borderRadius: 15, marginBottom: 12 },
    statusHeader: { flexDirection: 'row', alignItems: 'center' },
    statusMessage: { fontSize: 15, fontFamily: 'Rubik-Medium', color: '#1e293b' },
    statusDetailsContainer: { marginTop: 8, paddingLeft: 8 },
    statusDetailItem: { fontSize: 14, fontFamily: 'Rubik-Regular', color: '#475569' },
    priceContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 16, marginTop: 4 },
    priceLabel: { fontSize: 18, fontFamily: 'Rubik-Medium', color: '#1C1C1C' },
    priceValue: { fontSize: 26, fontFamily: 'Rubik-Medium', color: '#074ec2' },
    
    // Minimized Action Buttons (New Styles)
    actionButtonsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 15,
        marginBottom: 5,
    },
    miniActionButton: {
        width: 70, // Adjust size as needed
        height: 70, // Adjust size as needed
        borderRadius: 15, // Border radius for the square/rounded shape
        backgroundColor: '#22c55e', // Default for Add to Cart
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 8, // Added padding for better icon/text spacing
        paddingHorizontal: 4,
    },
    miniActionButtonText: {
        fontSize: 10, // Smaller font for minimized text
        fontFamily: 'Rubik-Medium',
        color: '#FFFFFF',
        marginTop: 4,
        textAlign: 'center',
    },
    // The previous actionButtonText, addToCartButton, saveButton, clearButton are now replaced/modified for miniActionButton
    saveButton: { backgroundColor: '#074ec2' }, // Specific color for Save
    loadButton: { backgroundColor: '#545be8' }, // Specific color for Load
    clearButton: { backgroundColor: '#E31C25' }, // Specific color for Clear
    
    disabledButton: { opacity: 0.5 }, // Renamed from disabledButton, now used for mini actions as well
    

    slotContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 26, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
    slotImage: { width: 60, height: 60, borderRadius: 15, marginRight: 12, backgroundColor: '#e2e8f0' },
    noImageIcon: { justifyContent: 'center', alignItems: 'center', }, // Style for when no image is available
    slotIcon: { width: 20, marginRight: 12, textAlign: 'center' },
    slotName: { fontSize: 16, fontFamily: 'Rubik-Regular', color: '#4d5d72ff' },
    slotNameUnselected: { fontSize: 16, fontFamily: 'Rubik-SemiBold', color: '#334155' },
    slotProduct: { fontSize: 16, fontFamily: 'Rubik-Bold', color: '#64748b', marginTop: 2 },
    slotPrice: { fontSize: 16, fontFamily: 'Rubik-Medium', color: '#1e293b' },
    // Updated required text style for better integration
    requiredTextIndicator: { 
        color: '#E31C25', 
        fontSize: 10, 
        fontFamily: 'Rubik-Medium', 
        marginLeft: 8, 
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 5,
        backgroundColor: '#ffe5e5', // Light red background
    },
    chooseButton: { backgroundColor: '#074ec2', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 15, flexDirection: 'row', alignItems: 'center' },
    chooseButtonText: { color: '#FFFFFF', fontFamily: 'Rubik-Medium', marginRight: 6, fontSize: 14 },
    changeButtonText: { color: '#074ec2', fontFamily: 'Rubik-Medium', marginTop: 4, fontSize: 12 },
    modalContainer: { flex: 1, backgroundColor: '#FFFFFF' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
    modalTitle: { fontSize: 20, fontFamily: 'Rubik-Medium', color: '#1C1C1C' },
    toggleContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
    toggleLabel: { fontSize: 16, fontFamily: 'Rubik-Regular', color: '#334155' },
    separator: { height: 1, backgroundColor: '#e2e8f0' },
    productItem: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#FFF' },
    incompatibleItem: { backgroundColor: '#ffe5e5', opacity: 0.7 }, // Lighter red for incompatible
    productImageModal: { width: 70, height: 70, borderRadius: 15, backgroundColor: '#e2e8f0', marginRight: 16 },
    productInfo: { flex: 1, marginRight: 8 },
    productName: { fontSize: 16, fontFamily: 'Rubik-Medium', color: '#1e293b' },
    productRating: { fontSize: 12, color: '#94a3b8', marginTop: 8 },
    productAction: { alignItems: 'flex-end', marginLeft: 12 },
    productPrice: { fontSize: 18, fontFamily: 'Rubik-Medium', color: '#074ec2', marginBottom: 8 },
    compatibilityWarningText: { color: '#f97316', fontFamily: 'Rubik-Medium', fontSize: 12, marginTop: 4 },
    noPartsText: { textAlign: 'center', marginTop: 40, fontSize: 16, color: '#64748b', fontFamily: 'Rubik-Regular' },

    // Alert & Confirmation Modal Styles
    modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
    alertModalContainer: { width: '85%', backgroundColor: 'white', borderRadius: 15, paddingTop: 25, paddingBottom: 20, paddingHorizontal: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
    alertModalTitle: { fontSize: 18, fontFamily: 'Rubik-Bold', color: '#1C1C1C', marginBottom: 8, textAlign: 'center' },
    alertModalMessage: { fontSize: 15, fontFamily: 'Rubik-Regular', color: '#4A4A4A', textAlign: 'center', marginBottom: 25, lineHeight: 22 },
    alertModalButton: { borderRadius: 10, paddingVertical: 12, width: '100%', alignItems: 'center' },
    alertModalButtonText: { color: 'white', fontSize: 16, fontFamily: 'Rubik-SemiBold' },
    modalActions: { flexDirection: 'row', width: '100%', justifyContent: 'space-between' },
    modalButton: { flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
    modalPrimaryButton: { backgroundColor: '#074ec2', marginLeft: 8 },
    modalSecondaryButton: { backgroundColor: '#F3F4F6', marginRight: 8, borderWidth: 1, borderColor: '#EAEAEA' },
    modalButtonTextPrimary: { color: 'white', fontSize: 16, fontFamily: 'Rubik-SemiBold' },
    modalButtonTextSecondary: { color: '#1C1C1C', fontSize: 16, fontFamily: 'Rubik-SemiBold' },

    // Success Toast Styles
    toastOverlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: 'center',   // center horizontally
        justifyContent: 'center', // center vertically
        zIndex: 9999,
    },
    toastContainer: {
        backgroundColor: '#4BB543',
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 20,
        alignItems: 'center',
        maxWidth: '80%',
        
    },
    toastText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontFamily: 'Rubik-Medium',
        textAlign: 'center',
    },
    
});

export default Builder;