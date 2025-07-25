    // ====================================================================
        // 1. CONFIGURATION ET CONSTANTES
    // ====================================================================
       let stockData = [];
        let originalStockQuantities = {};
        let stockAvailability = {};
        let lastOptimizationResult = null;
        let optimizationInProgress = false;
        
    //FONCTIONS DE BASE 
        function loadExample() {
            stockData = [
            //    // Famille ELECTROFONDUS avec différentes qualités électrofondus
                 {supplier: "SEFPR",ref: "PFI_023DA_000", length: 1500, width: 300, thickness: 412, quantity: 10, family: "ELECTROFONDUS", quality: "AZS 33% RC"},
               {supplier: "SEFPR",ref: "PFI_04X5A_000", length: 890, width: 400, thickness: 250, quantity: 21, family: "ELECTROFONDUS", quality: "AZS 33% VF"},
                {supplier: "SEFPR",ref: "PFI_05B2A_000", length: 1200, width: 350, thickness: 380, quantity: 13, family: "ELECTROFONDUS", quality: "AZS 41% VF"},
                 {supplier: "SEFPR",ref: "PFI_06C3A_000", length: 800, width: 300, thickness: 250, quantity: 5, family: "ELECTROFONDUS", quality: "95% ZrO2"},
                {supplier: "SEFPR",ref: "PFI_07D4A_000", length: 950, width: 280, thickness: 320, quantity: 12, family: "ELECTROFONDUS", quality: "ER 1682 RX"},
                 {supplier: "SEFPR",ref: "PFI_08E5A_000", length: 750, width: 250, thickness: 200, quantity: 4, family: "ELECTROFONDUS", quality: "ER 5312 RX"},
                {supplier: "SEFPR",ref: "PFI_09F6A_000", length: 600, width: 300, thickness: 150, quantity: 11, family: "ELECTROFONDUS", quality: "Jargal"},
                
                 // Famille ZIRCON DENSE/MULLITE avec qualités zircon
                 {supplier: "SEFPR",ref: "PFI_0700C_000", length: 1400, width: 700, thickness: 400, quantity: 53, family: "ZIRCON DENSE", quality: "ZM30%"},
                 {supplier: "SEFPR",ref: "PFI_0550D_001", length: 1100, width: 550, thickness: 320, quantity: 4, family: "ZIRCON MULLITE", quality: "ZM20%"},
                
                 // Famille SILLIMANITE avec qualités silico-alumineux
                 {supplier: "SEFPR",ref: "PFI_1400E_000", length: 950, width: 480, thickness: 310, quantity: 46, family: "SILLIMANITE", quality: ">99% Al2O3"},
                {supplier: "SEFPR",ref: "PFI_0401E_000", length: 850, width: 420, thickness: 280, quantity: 8, family: "SILLIMANITE", quality: "60% Al2O3"},
                 {supplier: "SEFPR",ref: "PFI_1402E_000", length: 750, width: 380, thickness: 250, quantity: 5, family: "SILLIMANITE", quality: "40/42% Al2O3"},
                 {supplier: "SEFPR",ref: "PFI_7403E_000", length: 650, width: 340, thickness: 220, quantity: 7, family: "SILLIMANITE", quality: "35% Al2O3"},
                
            //     // Famille DIVERS avec qualités magnésie
                 {supplier: "SEFPR",ref: "PFI_2600G_000", length: 1300, width: 650, thickness: 380, quantity: 52, family: "DIVERS", quality: "MgO > 95%"},
               {supplier: "SEFPR",ref: "PFI_6201G_000", length: 1100, width: 550, thickness: 320, quantity: 13, family: "DIVERS", quality: "MgO 85-90%"},
                {supplier: "SEFPR",ref: "PFI_6402G_000", length: 900, width: 450, thickness: 280, quantity: 4, family: "DIVERS", quality: "MgO 70-75%"},
                 {supplier: "SEFPR",ref: "PFI_6603G_000", length: 700, width: 350, thickness: 240, quantity: 6, family: "DIVERS", quality: "MgO 50-60%"},
                
            //     // Famille SILICE avec qualités silice
               {supplier: "SEFPR",ref: "PFI_0450B_001", length: 1200, width: 600, thickness: 350, quantity: 75, family: "SILICE", quality: "SiO2 99%"},
                 {supplier: "SEFPR",ref: "PFI_0300A_002", length: 1000, width: 500, thickness: 300, quantity: 18, family: "SILICE", quality: "SiO2 95%"},
                
                // Famille ISOLANTS avec quelques qualités mixtes
              {supplier: "SEFPR",ref: "PFI_2650F_001", length: 800, width: 400, thickness: 250, quantity: 12, family: "ISOLANTS", quality: "Non défini"},
                {supplier: "SEFPR",ref: "PFI_3950H_001", length: 900, width: 450, thickness: 280, quantity: 27, family: "40% AL2O3", quality: "Non défini"},
                
                // Stock Standard
               // {supplier: "Non défini",ref: "Non défini", length: 600, width: 500, thickness: 120, quantity: 40000, family: "Non défini", quality: "Non défini"},
               // {supplier: "Non défini",ref: "Non défini", length: 600, width: 500, thickness: 100, quantity: 40000, family: "Non défini", quality: "Non défini"},
               // {supplier: "Non défini",ref: "Non défini", length: 600, width: 500, thickness: 75, quantity: 40000, family: "Non défini", quality: "Non défini"}
            ];
            originalStockQuantities={};
            stockAvailability = {};
                stockData.forEach(item => {
                originalStockQuantities[item.ref] = item.quantity;  // Stock initial fixe
                stockAvailability[item.ref] = item.quantity;        // Stock courant
            });
            updateFilters();
            updateStockDisplay();
            showStatus('success', '✅ Exemple chargé avec ' + stockData.length + ' casiers !');
        }

        function clearStock() {
            if (confirm('Êtes-vous sûr de vouloir vider le stock ?')) {
                stockData = [];
                updateFilters();
                updateStockDisplay();
                showStatus('warning', '🗑️ Stock vidé');
                document.getElementById('resultsSection').style.display = 'none';
                lastOptimizationResult = null;
            }
        }

        function showStatus(type, message) {
            const status = document.getElementById('importStatus');
            status.style.display = 'block';
            status.className = 'alert alert-' + type;
            status.textContent = message;
            
            // Disparition automatique après 3 secondes
            if (type === 'success') {
                setTimeout(() => {
                    status.style.display = 'none';
                }, 3000);
            }
        }

        function updateFilters() {
            const familyFilter = document.getElementById('familyFilter');
            const qualityFilter = document.getElementById('qualityFilter');

            const families = [...new Set(stockData.map(item => item.family).filter(Boolean))].sort();
            const qualities = [...new Set(stockData.map(item => item.quality).filter(Boolean))].sort();

            const currentFamily = familyFilter.value;
            familyFilter.innerHTML = '<option value="">Toutes les familles</option>';
            families.forEach(family => {
                const option = document.createElement('option');
                option.value = family;
                option.textContent = family;
                if (family === currentFamily) option.selected = true;
                familyFilter.appendChild(option);
            });

            const currentQuality = qualityFilter.value;
            qualityFilter.innerHTML = '<option value="">Toutes les qualités</option>';
            qualities.forEach(quality => {
                const option = document.createElement('option');
                option.value = quality;
                option.textContent = quality;
                if (quality === currentQuality) option.selected = true;
                qualityFilter.appendChild(option);
            });
        }

        function getFilteredStock() {
            const familyFilter = document.getElementById('familyFilter').value;
            const qualityFilter = document.getElementById('qualityFilter').value;

            let filtered = stockData.filter(item => {
                const familyMatch = !familyFilter || item.family === familyFilter;
                const qualityMatch = !qualityFilter || item.quality === qualityFilter;
                return familyMatch && qualityMatch;
            });

            const targetThickness = Number(document.getElementById('targetThickness').value);

            // Calculate scores for all items and sort by score
            filtered.forEach(item => {
                item.currentScore = calculateBlockScore(item);
            });

            filtered.sort((a, b) => (b.currentScore || 0) - (a.currentScore || 0));

            return filtered;
        }

        function updateStockDisplay() {
            const tbody = document.getElementById('stockTableBody');
            const targetThickness = Number(document.getElementById('targetThickness').value);

            if (stockData.length === 0) {
                tbody.innerHTML = '<tr><td colspan="11" style="text-align: center; color: #666; padding: 20px;">Aucun stock chargé</td></tr>';
                document.getElementById('stockCount').textContent = '0';
                document.getElementById('filteredCount').textContent = '0';
                return;
            }

            const filtered = getFilteredStock();
            let html = '';

           filtered.forEach(item => {
    const isCompatible = item.thickness >=100;
    const score = item.currentScore || 0;
    const scoreColor = score >= 80 ? '#27ae60' : score >= 50 ? '#f39c12' : '#e74c3c';
    
    // CORRECTION : Les quantités ne changent jamais à cause du filtre d'épaisseur
    const originalQty = item.quantity || 0;  // Stock initial du fichier Excel
    
    // Stock courant (peut avoir changé après optimisations)
    let currentQty = originalQty;
    if (stockAvailability && stockAvailability[item.ref] !== undefined) {
        currentQty = stockAvailability[item.ref];
    }
    
    // DEBUG pour identifier le problème
    if (!isCompatible && originalQty > 0) {
        console.log(`🔍 Bloc ${item.ref} non compatible (épaisseur ${item.thickness}mm < ${targetThickness}mm) mais stock=${originalQty}`);
    }

    const stockColor = currentQty > 10 ? '#27ae60' : currentQty > 5 ? '#f39c12' : currentQty > 0 ? '#e74c3c' : '#95a5a6';
    const stockText = currentQty === 0 ? '0 (Épuisé)' : currentQty.toString();
    
    // Classes CSS pour l'état du stock
    let rowClass = '';
    if (currentQty === 0) rowClass = 'stock-depleted';
    else if (currentQty <= 5) rowClass = 'stock-critical';
    
    // Style pour blocs non compatibles (grisés mais quantités visibles)
    const rowStyle = !isCompatible ? 'opacity: 0.6; background-color: #f8f9fa;' : '';
    
    html += `<tr class="${rowClass}" style="${rowStyle}">
        <td style="font-weight: 600; color: #2980b9;">${item.ref}</td>
        <td style="font-size: 0.8rem; color: #666;">${item.family || '-'}</td>
        <td style="font-size: 0.8rem; color: #666;">${item.quality || '-'}</td>
        <td style="font-size: 0.8rem; color: #666;">${item.supplier || '-'}</td>
        <td>${item.length} mm</td>
        <td>${item.width} mm</td>
        <td style="color: ${isCompatible ? '#27ae60' : '#e74c3c'};">${item.thickness} mm</td>
        <td style="font-weight: 600;">${originalQty}</td>
        <td style="color: ${stockColor}; font-weight: 600;">${stockText}</td>
        <td style="color: ${isCompatible ? '#27ae60' : '#e74c3c'}; font-weight: 600;">
            ${item.thickness>=100 ? '🔧 Découpe auto' : '❌ Non'}
        </td>
        <td style="color: ${isCompatible ? scoreColor : '#ccc'}; font-weight: 600;">${isCompatible ? score : '-'}</td>
    </tr>`;
});
// DEBUG : Vérifier si le filtre modifie incorrectement les quantités
console.log('🔍 Vérification filtre d\'épaisseur:');
const thicknessMismatch = filtered.filter(item => 
    item.thickness < targetThickness && item.quantity > 0
);

if (thicknessMismatch.length > 0) {
    console.log(`⚠️ ${thicknessMismatch.length} blocs avec stock>0 mais épaisseur insuffisante:`);
    thicknessMismatch.slice(0, 5).forEach(item => {
        console.log(`  ${item.ref}: ${item.thickness}mm < ${targetThickness}mm, stock=${item.quantity}`);
    });
}
            const compatibleCount = filtered.filter(item => item.thickness === targetThickness).length;
            const totalCurrentStock = filtered.reduce((sum, item) => sum + (stockAvailability[item.ref] !== undefined ? stockAvailability[item.ref] : (originalStockQuantities[item.ref]|| 0)), 0);
            const availableCount = filtered.filter(item => {
                const stock = stockAvailability[item.ref] !== undefined ? stockAvailability[item.ref] : (originalStockQuantities[item.ref] || 0);
                return stock > 0;
            }).length;
            html += `<tr style="background: #f8f9fa; font-weight: 600; border-top: 2px solid #ddd;">
                <td>TOTAL : </td>
                <td colspan="5">${filtered.length} casiers (${compatibleCount} compatibles, ${availableCount} en stock)</td>
                <td>-</td>
                <td>Total: ${totalCurrentStock}</td>
                <td>-</td>
                <td>-</td>
            </tr>`;

            tbody.innerHTML = html;
            document.getElementById('stockCount').textContent = stockData.length.toString();
            document.getElementById('filteredCount').textContent = filtered.length.toString();
        }

        function calculateBlockScore(block) {
            const targetLength = Number(document.getElementById('targetLength').value) || 3000;
            const targetWidth = Number(document.getElementById('targetWidth').value) || 2000;
            const numRows = Number(document.getElementById('numRows').value) || 3;

            const avgRowHeight = targetWidth / numRows;
            let score = 0;

            // Score taille (0-50 points)
            const blockArea = block.length * block.width;
            const avgZoneArea = (targetLength / 3) * avgRowHeight;
            const sizeRatio = Math.min(blockArea / avgZoneArea, 2);
            score += Math.min(sizeRatio * 25, 50);

            // Compatibilité de hauteur (0-30 points)
            const heightCompatibility = Math.min(block.width / avgRowHeight, 1);
            score += heightCompatibility * 30;

            // Proportion Score (0-20 points)
            const ratio = Math.max(block.length, block.width) / Math.min(block.length, block.width);
            const proportionScore = Math.max(0, 1 - (ratio - 1) / 4);
            score += proportionScore * 20;

            return Math.round(score);
        }
        // FONCTIONS D'OPTIMISATION
        async function optimizeWall() {
            if (!stockData.length) {
                alert('Chargez d\'abord un stock !');
                return;
            }

            if (optimizationInProgress) {
                return;
            }

            optimizationInProgress = true;
            const targetLength = Number(document.getElementById('targetLength').value);
            const targetWidth = Number(document.getElementById('targetWidth').value);
            const targetThickness = Number(document.getElementById('targetThickness').value);
            const numRows = Number(document.getElementById('numRows').value);

            document.getElementById('resultsSection').style.display = 'block';
            document.getElementById('status').textContent = 'Optimisation avec jointures décalées...';
            document.getElementById('status').className = 'alert alert-info';
            
            const progressContainer = document.getElementById('progressBarContainer');
            const progressFill = document.getElementById('progressFill');
            progressContainer.style.display = 'block';
            progressFill.style.width = '0%';

            try {
                // Simulate progress updates
                const progressSteps = [20, 40, 60, 80, 100];
                for (let i = 0; i < progressSteps.length; i++) {
                    await new Promise(resolve => setTimeout(resolve, 200));
                    progressFill.style.width = progressSteps[i] + '%';
                }
                // NOUVELLE LOGIQUE D'OPTIMISATION
                const filtered = getFilteredStock();
                const available = filtered; //Tous les blocs filtrés, sans restriction d'épaisseur

                if (available.length === 0) {
                    throw new Error('Aucun casier compatible avec l\'épaisseur de ' + targetThickness + 'mm');
                }
                const wallBuilder = new WallBuilder(
                    targetLength, 
                    targetWidth, 
                    targetThickness, 
                    numRows, 
                    Number(document.getElementById('jointOffset').value) || 50
                );
                const result = wallBuilder.buildWall(available);
                wallBuilder.updateGlobalStock();
                lastOptimizationResult = result;
                displayResults(result);
            } catch (error) {
                showStatus('danger', '❌ Erreur lors de l\'optimisation: ' + error.message);
            } finally {
                optimizationInProgress = false;
                progressContainer.style.display = 'none';
            }
        }

class WallBuilder {
    constructor(targetX, targetY, targetThickness, numRows, jointOffset = 50, maxExtraRows = 5) {
    this.target = { x: targetX, y: targetY, thickness: targetThickness };
    this.numRows = numRows;
    this.maxExtraRows = maxExtraRows;
    this.baseRowHeight = targetY / numRows;
    this.minRowHeightRatio = 0.8;
    this.jointOffset = jointOffset;
    this.solution = [];
    this.currentStockAvailability = {};
    
    console.log(`🏗️ WallBuilder créé: ${targetX}×${targetY}×${targetThickness}mm`);
    console.log(`📏 ${numRows} rangées cibles (+${maxExtraRows} max supplémentaires)`);
    console.log(`📏 Hauteur de base: ${this.baseRowHeight}mm (min: ${this.baseRowHeight * this.minRowHeightRatio}mm)`);
}

    // Méthode principale qui remplacera optimizeWithJointConstraints
    buildWall(stockData) {
        console.log('🔄 Début construction du mur...');
        
        // Initialiser le stock local pour l'optimisation
        this.initializeLocalStock(stockData);
        

        // NOUVEAU : Optimiser la stratégie de rangées
    const strategy = this.optimizeRowStrategy();
    
    // Utiliser la stratégie optimisée
    const actualTargetRows = strategy.rows;
    const optimizedRowHeight = strategy.rowHeight;
    
    console.log(`🎯 Stratégie appliquée: ${actualTargetRows} rangées (au lieu de ${this.numRows})`);
    
    let currentY = 0;
    let actualRowCount = 0;
    let previousJoints = [];
    const maxRows = actualTargetRows + 5; // 5 rangées de sécurité en plus

        while (currentY < this.target.y && actualRowCount < maxRows) {
            console.log(`\n📋 Construction rangée ${actualRowCount + 1} à Y=${currentY}`);
            
            const remainingHeight = this.target.y - currentY;
            const targetRowHeight = Math.min(optimizedRowHeight, remainingHeight);
            const minRowHeight = targetRowHeight * this.minRowHeightRatio;
            
            console.log(`🎯 Hauteur cible: ${targetRowHeight}mm, minimum: ${minRowHeight}mm`);
            
            const rowBlocks = this.buildRow(
                currentY,
                targetRowHeight,
                minRowHeight,
                previousJoints,
                actualRowCount + 1,
                remainingHeight
            );
            
            if (rowBlocks.length === 0) {
                console.log('❌ Impossible de construire cette rangée');
                break;
            }
            
            // Calculer la hauteur réelle de la rangée
            const actualRowHeight = Math.max(...rowBlocks.map(b => b.height));
            console.log(`✅ Rangée ${actualRowCount + 1} terminée: ${rowBlocks.length} blocs, hauteur ${actualRowHeight}mm`);
            
            this.solution.push(...rowBlocks);
            
            // Calculer les nouvelles jointures
            const newJoints = this.calculateRowJoints(rowBlocks);
            
            currentY += actualRowHeight;
            actualRowCount++;
            previousJoints = newJoints;
        }

        return this.createResult(actualRowCount);
    }
    // Générer toutes les permutations possibles d'un bloc (rotation complète des 3 dimensions)
generateBlockPermutations(block) {
    const permutations = [];
    const dimensions = [block.length, block.width, block.thickness];
    
    // Générer toutes les permutations possibles des 3 dimensions
    const allOrientations = [
        // Format: [longueur, largeur, épaisseur]
        [dimensions[0], dimensions[1], dimensions[2]], // L×l×É (normal)
        [dimensions[0], dimensions[2], dimensions[1]], // L×É×l (épaisseur et largeur échangées)
        [dimensions[1], dimensions[0], dimensions[2]], // l×L×É (longueur et largeur échangées)
        [dimensions[1], dimensions[2], dimensions[0]], // l×É×L (rotation complète)
        [dimensions[2], dimensions[0], dimensions[1]], // É×L×l (rotation complète)
        [dimensions[2], dimensions[1], dimensions[0]]  // É×l×L (rotation complète)
    ];
    
    allOrientations.forEach((orientation, index) => {
        const [newLength, newWidth, newThickness] = orientation;
        
        // Vérifier si cette orientation donne la bonne épaisseur pour le mur
        if (newThickness >= this.target.thickness) {
            permutations.push({
                ...block,
                useLength: newLength,
                useWidth: newWidth,
                useThickness: newThickness,
                rotated: index > 0, // Toute orientation autre que la première est une rotation
                thicknessCut: newThickness > this.target.thickness,
                orientation: `rotation_${index}`,
                coverageArea: newLength * newWidth,
                maxDimension: Math.max(newLength, newWidth),
                minDimension: Math.min(newLength, newWidth)
            });
        }
    });
    
    console.log(`🔄 Bloc ${block.ref} (${block.length}×${block.width}×${block.thickness}): ${permutations.length} orientations possibles`);
    return permutations;
}

    // Initialiser le stock local (copie de stockAvailability)
initializeLocalStock(stockData) {
    this.filteredStockData = stockData; // NOUVEAU : stocker les blocs filtrés
    this.currentStockAvailability = {};
    originalStockQuantities = {};
    stockAvailability = {};
    
    stockData.forEach(item => {
        const quantity = typeof item.quantity === 'number' ? item.quantity : parseInt(item.quantity) || 0;
    
        originalStockQuantities[item.ref] = quantity;
        stockAvailability[item.ref] = quantity;
        this.currentStockAvailability[item.ref] = quantity;
    
        console.log(`📦 Stock initialisé pour ${item.ref}: ${quantity} unités`);
    });
    
    console.log('📦 Stock local initialisé:', this.currentStockAvailability);
}

    // Calculer les jointures d'une rangée
    calculateRowJoints(rowBlocks) {
        const joints = [];
        let x = 0;
        
        for (const block of rowBlocks) {
            x += block.width;
            if (x < this.target.x) { // Pas de jointure à la fin du mur
                joints.push(x);
            }
        }
        
        return joints;
    }
    // Optimiser le nombre de rangées pour minimiser l'utilisation des casiers
optimizeRowStrategy() {
    const availableBlocks = this.getAvailableBlocks();
    const totalAvailablePieces = Object.values(this.currentStockAvailability).reduce((sum, qty) => sum + qty, 0);
    
    console.log(`🎯 Optimisation stratégique: ${totalAvailablePieces} casiers disponibles`);
    
    // Calculer différentes stratégies de rangées
    const strategies = [];
    
    for (let extraRows = 0; extraRows <= this.maxExtraRows; extraRows++) {
        const testRows = this.numRows + extraRows;
        const testRowHeight = this.target.y / testRows;
        const testMinHeight = testRowHeight * this.minRowHeightRatio;
        
        // Estimer combien de casiers seraient nécessaires avec cette stratégie
        const estimatedCasiers = this.estimateCasiersNeeded(testRows, testRowHeight, testMinHeight);
        
        strategies.push({
            rows: testRows,
            rowHeight: testRowHeight,
            minHeight: testMinHeight,
            estimatedCasiers: estimatedCasiers,
            efficiency: estimatedCasiers > 0 ? (this.target.x * this.target.y) / (estimatedCasiers * 1000000) : 0 // Estimation grossière
        });
        
        console.log(`📊 Stratégie ${testRows} rangées: ~${estimatedCasiers} casiers estimés`);
    }
    
    // Choisir la stratégie qui minimise l'utilisation des casiers
    strategies.sort((a, b) => a.estimatedCasiers - b.estimatedCasiers);
    const bestStrategy = strategies[0];
    
    console.log(`🏆 Stratégie choisie: ${bestStrategy.rows} rangées (hauteur: ${bestStrategy.rowHeight.toFixed(0)}mm)`);
    
    return bestStrategy;
}

// Estimer le nombre de casiers nécessaires pour une stratégie donnée
estimateCasiersNeeded(numRows, rowHeight, minHeight) {
    const availableBlocks = this.getAvailableBlocks();
    let estimatedTotal = 0;
    
    for (let row = 0; row < numRows; row++) {
        // Pour chaque rangée, estimer combien de casiers seraient nécessaires
        let remainingX = this.target.x;
        let rowCasiers = 0;
        
        while (remainingX > 100 && rowCasiers < 20) { // Limite sécurité
            // Trouver un bloc typique pour cette hauteur
            const suitableBlock = availableBlocks.find(block => {
                const orientations = [
                    { width: block.length, height: block.width },
                    { width: block.width, height: block.length }
                ];
                return orientations.some(o => o.height >= minHeight && o.width <= remainingX);
            });
            
            if (!suitableBlock) break;
            
            // Estimer la largeur utilisée
            const avgWidth = Math.min(suitableBlock.length, suitableBlock.width, remainingX);
            remainingX -= avgWidth;
            rowCasiers++;
        }
        
        estimatedTotal += rowCasiers;
    }
    
    return estimatedTotal;
}
    // Créer le résultat final
createResult(actualRowCount) {
    // Garder les volumes en mm³ pour les calculs précis
    const wallVolumeeMm3 = this.target.x * this.target.y * this.target.thickness;
    const usedVolumeMm3 = this.solution.reduce((sum, block) => 
        sum + (block.width * block.height * block.thickness), 0);
    const totalWasteVolumeMm3 = this.solution.reduce((sum, block) => 
        sum + (block.wasteVolume || 0), 0);
    
    // Convertir en m³ avec précision contrôlée
    const wallVolumeM3 = Math.round((wallVolumeeMm3 / 1e9) * 100) / 100; // 2 décimales
    const usedVolumeM3 = Math.round((usedVolumeMm3 / 1e9) * 100) / 100;
    const totalWasteVolumeM3 = Math.round((totalWasteVolumeMm3 / 1e9) * 100) / 100;
    
    const coverage = (usedVolumeMm3 / wallVolumeeMm3) * 100;
    const efficiency = usedVolumeMm3 / (usedVolumeMm3 + totalWasteVolumeMm3) * 100;
    const totalCuts = this.solution.reduce((sum, block) => sum + (block.cuts || 0), 0);
    const jointViolations = this.solution.filter(block => block.violatesJoints).length;
    const actualCoverage = this.validateAndAdjustResult();

    const result = {
        blocks: this.solution,
        coverage: actualCoverage,
        efficiency: Math.round(efficiency * 10) / 10,
        totalCuts: totalCuts,
        totalWasteVolume: totalWasteVolumeMm3, // Garder en mm³ pour compatibilité
        totalWasteVolumeM3: totalWasteVolumeM3, // NOUVEAU : en m³
        wallVolume: wallVolumeeMm3, // Garder en mm³ pour compatibilité
        wallVolumeM3: wallVolumeM3, // NOUVEAU : en m³
        numRows: actualRowCount,
        targetRows: this.numRows,
        jointViolations: jointViolations
    };

    console.log('🎉 Construction terminée:', result);
    return result;
}

    // Construire une rangée complète avec hauteur UNIFORME
buildRow(currentY, targetHeight, minHeight, previousJoints, rowNumber, remainingWallHeight) {
    let currentX = 0;
    const rowBlocks = [];

    // ÉTAPE 1 : Déterminer LA hauteur unique pour toute cette rangée
    const uniformRowHeight = this.findOptimalRowHeight(targetHeight, minHeight, remainingWallHeight);
    
    console.log(`🔒 HAUTEUR FIXE pour rangée ${rowNumber}: ${uniformRowHeight}mm`);

    // ÉTAPE 2 : Placer les blocs avec cette hauteur fixe
    while (currentX < this.target.x) {
        const remainingX = this.target.x - currentX;
        
        console.log(`📍 Position X=${currentX}, reste ${remainingX}mm à couvrir`);
        
        // Trouver le meilleur bloc pour cette hauteur FIXE
        const bestBlock = this.findBestBlockForFixedHeight(
            remainingX, 
            uniformRowHeight,  // ⚠️ Hauteur FIXE imposée
            currentX, 
            previousJoints
        );

        if (!bestBlock) {
    // Si il reste peu de largeur à couvrir, étendre le dernier bloc
    if (remainingX <= 50 && rowBlocks.length > 0) {
        const lastBlock = rowBlocks[rowBlocks.length - 1];
        console.log(`🔧 Extension automatique: ${lastBlock.ref} +${remainingX}mm pour finir la rangée`);
        
        lastBlock.width += remainingX;
        lastBlock.extendedToEnd = true;
        if (lastBlock.cutDetails) {
            lastBlock.cutDetails.push(`Extension: +${remainingX}mm pour finir rangée`);
        }
        
        // Recalculer les chutes
        const originalVolume = lastBlock.originalLength * lastBlock.originalWidth * lastBlock.originalThickness;
        const newUsedVolume = lastBlock.width * lastBlock.height * lastBlock.thickness;
        lastBlock.wasteVolume = originalVolume - newUsedVolume;
        
        break; // Rangée terminée
    }
    
    console.log(`❌ Aucun bloc trouvé pour X=${currentX} avec hauteur ${uniformRowHeight}mm`);
    break;
}

        // Placer le bloc avec la hauteur EXACTE de la rangée
        const placedBlock = this.placeBlockWithFixedHeight(
            bestBlock, 
            currentX, 
            currentY, 
            remainingX, 
            uniformRowHeight, // ⚠️ Hauteur FIXE
            rowNumber
        );

        console.log(`✅ Bloc ${placedBlock.ref} placé: ${placedBlock.width}×${placedBlock.height}×${placedBlock.thickness}mm`);

        rowBlocks.push(placedBlock);
        currentX += placedBlock.width;

        // Décrémenter le stock
        this.currentStockAvailability[bestBlock.ref]--;
    }

    // VÉRIFICATION : Tous les blocs ont la même hauteur
    const heights = [...new Set(rowBlocks.map(b => b.height))];
    if (heights.length > 1) {
        console.error(`❌ ERREUR: Hauteurs différentes dans rangée ${rowNumber}:`, heights);
    } else {
        console.log(`✅ Rangée ${rowNumber} uniforme: ${heights[0]}mm`);
    }

    return rowBlocks;
}
// Trouver le meilleur bloc en utilisant TOUTES les permutations possibles
findBestBlockForFixedHeight(maxWidth, requiredHeight, currentX, forbiddenJoints) {

    const availableBlocks = this.getAvailableBlocks();
const allPermutations = [];
availableBlocks.forEach(block => {
    const blockPermutations = this.generateBlockPermutations(block);
    allPermutations.push(...blockPermutations);
});

// Trier par potentiel de couverture
allPermutations.sort((a, b) => {
    // 1. Priorité aux blocs avec GRANDE largeur (pour couvrir plus de distance X)
    const aWidth = a.useLength;
    const bWidth = b.useLength;
    if (Math.abs(aWidth - bWidth) > 50) { // Différence significative
        return bWidth - aWidth; // Plus large d'abord
    }
    
    // 2. Si largeurs similaires, priorité à la surface
    return b.coverageArea - a.coverageArea;
});
    let bestBlock = null;
    let bestScore = -1;

    console.log(`🔍 Recherche parmi ${allPermutations.length} permutations pour X=${currentX}, H=${requiredHeight}mm, L_max=${maxWidth}mm`);

    // STRATÉGIE 1 : Chercher d'abord des solutions sans violations
    for (let allowViolations = false; allowViolations <= true; allowViolations++) {
        console.log(allowViolations ? '⚠️ Phase 2: accepter violations' : '✅ Phase 1: éviter violations');
        
        for (const permutation of allPermutations) {
            // Vérifier si cette permutation peut convenir en hauteur
            if (permutation.useWidth < requiredHeight * this.minRowHeightRatio) continue;
            
            // Calculer les largeurs possibles pour cette permutation
            const possibleWidths = this.calculatePossibleWidthsForPermutation(
                permutation, 
                maxWidth, 
                currentX, 
                forbiddenJoints, 
                allowViolations
            );

            for (const widthOption of possibleWidths) {
                const jointPosition = currentX + widthOption.width;
                const violatesJoints = this.violatesJointConstraint(jointPosition, forbiddenJoints);
                
                // Si on est en phase 1, ignorer les violations
                if (!allowViolations && violatesJoints) continue;
                
                const score = this.calculatePermutationScore(
                    permutation, 
                    widthOption, 
                    maxWidth, 
                    requiredHeight, 
                    violatesJoints
                );

                console.log(`📦 ${permutation.ref} (${permutation.orientation}): ${widthOption.width}×${requiredHeight}mm → score ${score.toFixed(1)} ${violatesJoints ? '⚠️' : '✅'}`);

                if (score > bestScore) {
                    bestScore = score;
                    bestBlock = { 
                        ...permutation, 
                        useWidth: widthOption.width,
                        useHeight: Math.min(permutation.useWidth, requiredHeight), // Découpe hauteur si nécessaire
                        violatesJoints: violatesJoints,
                        widthStrategy: widthOption.strategy,
                        finalScore: score
                    };
                }
            }
        }
        
        // Si on a trouvé une solution sans violation, on s'arrête
        if (bestBlock && !bestBlock.violatesJoints) {
            console.log('🎉 Solution trouvée sans violation !');
            break;
        }
    }

        if (bestBlock) {
            console.log(`🏆 Meilleur choix: ${bestBlock.ref} - ${bestBlock.useLength}×${bestBlock.useWidth}mm (score: ${bestScore.toFixed(1)})`);
            console.log(`   Largeur utilisée: ${bestBlock.useWidth}mm sur ${maxWidth}mm disponible`);
}

    return bestBlock;
}
// Calculer les largeurs possibles pour une permutation spécifique
calculatePossibleWidthsForPermutation(permutation, maxWidth, currentX, forbiddenJoints, allowViolations) {
    const possibleWidths = [];
    const blockMaxWidth = permutation.useLength; // Largeur max du bloc dans cette orientation
    
    // OPTION 1 : Bloc entier (priorité absolue)
    if (blockMaxWidth <= maxWidth) {
        const violatesJoints = this.violatesJointConstraint(currentX + blockMaxWidth, forbiddenJoints);
        if (allowViolations || !violatesJoints) {
            possibleWidths.push({
                width: blockMaxWidth,
                bonus: 50 + Math.min(blockMaxWidth / 50, 30), // Gros bonus pour blocs entiers
                strategy: `bloc entier ${permutation.orientation}`,
                cuts: permutation.thicknessCut ? 1 : 0
            });
        }
    }
    
    // OPTION 2 : Largeur maximale disponible
    if (maxWidth < blockMaxWidth && maxWidth >= 200) {
        possibleWidths.push({
            width: maxWidth,
            bonus: 30 + Math.min(maxWidth / 100, 20),
            strategy: `découpe largeur (${maxWidth}mm)`,
            cuts: 1 + (permutation.thicknessCut ? 1 : 0)
        });
    }
    
    // OPTION 3 : Largeurs calculées pour éviter jointures
    if (!allowViolations) {
        forbiddenJoints.forEach(forbiddenX => {
            const safeWidth = Math.max(200, forbiddenX - currentX - this.jointOffset);
            if (safeWidth <= maxWidth && safeWidth <= blockMaxWidth && safeWidth >= 200) {
                possibleWidths.push({
                    width: safeWidth,
                    bonus: 15 + Math.min(safeWidth / 150, 15),
                    strategy: `évitement jointure`,
                    cuts: (safeWidth < blockMaxWidth ? 1 : 0) + (permutation.thicknessCut ? 1 : 0)
                });
            }
        });
    }
    
    // Trier par bonus décroissant
    possibleWidths.sort((a, b) => b.bonus - a.bonus);
    return possibleWidths;
}

// Score spécialisé pour les permutations - VERSION OPTIMISÉE
calculatePermutationScore(permutation, widthOption, maxWidth, requiredHeight, violatesJoints) {
    // 1. Score de couverture X (60% du score) - AUGMENTÉ
    const coverageScore = (widthOption.width / maxWidth) * 60;
    
    // 2. GROS BONUS pour les blocs qui couvrent beaucoup de largeur
    const absoluteWidthBonus = Math.min(widthOption.width / 100, 30); // Jusqu'à 30% pour les gros blocs
    
    // 3. Pénalité FORTE pour les petits blocs
    const smallBlockPenalty = widthOption.width < 300 ? -25 : 0; // -25% pour blocs < 300mm
    
    // 4. Pénalité pour les découpes - RÉDUITE
    const cutPenalty = widthOption.cuts * 5; // -5% par découpe (réduit de 8% à 5%)
    
    // 5. Pénalité TRÈS FORTE pour violations de jointures
    const jointPenalty = violatesJoints ? -50 : 0; // -50% !
    
    const totalScore = coverageScore + absoluteWidthBonus + smallBlockPenalty - cutPenalty + jointPenalty;
    
    return Math.max(0, totalScore);
}
// Calculer les largeurs possibles en PRIVILÉGIANT les grandes largeurs
calculatePossibleWidths(blockWidth, maxWidth, currentX, forbiddenJoints, allowViolations) {
    const possibleWidths = [];
    
    // OPTION 1 : Utiliser le bloc entier (priorité absolue)
    if (blockWidth <= maxWidth) {
        const jointPosition = currentX + blockWidth;
        const violatesJoints = this.violatesJointConstraint(jointPosition, forbiddenJoints);
        
        if (allowViolations || !violatesJoints) {
            possibleWidths.push({
                width: blockWidth,
                bonus: 40 + Math.min(blockWidth / 100, 20), // Gros bonus + bonus proportionnel à la taille
                strategy: `bloc entier (${blockWidth}mm)`
            });
        }
    }
    
    // Si on a une option "bloc entier" sans violation, on privilégie ça
    if (possibleWidths.length > 0 && !allowViolations) {
        return possibleWidths;
    }
    
    // OPTION 2 : Utiliser la largeur maximale disponible (même si découpe)
    if (maxWidth < blockWidth && maxWidth >= 300) { // Minimum 300mm pour être utile
        possibleWidths.push({
            width: maxWidth,
            bonus: 25 + Math.min(maxWidth / 100, 15), // Bonus proportionnel
            strategy: `largeur max (${maxWidth}mm)`
        });
    }
    
    // OPTION 3 : Découpes intelligentes pour éviter jointures (seulement si nécessaire)
    if (!allowViolations && forbiddenJoints.length > 0) {
        for (const forbiddenX of forbiddenJoints) {
            const safeWidth = Math.max(300, forbiddenX - currentX - this.jointOffset);
            
            if (safeWidth <= maxWidth && safeWidth < blockWidth && safeWidth >= 300) {
                possibleWidths.push({
                    width: safeWidth,
                    bonus: 10 + Math.min(safeWidth / 200, 10), // Bonus réduit mais proportionnel
                    strategy: `évitement ${forbiddenX} (${safeWidth}mm)`
                });
            }
        }
    }
    
    // Trier par bonus décroissant (privilégier les grandes largeurs)
    possibleWidths.sort((a, b) => b.bonus - a.bonus);
    
    return possibleWidths.length > 0 ? possibleWidths : [{
        width: Math.min(blockWidth, maxWidth),
        bonus: -20, // Forte pénalité
        strategy: 'fallback'
    }];
}
// Calculer le score en PRIVILÉGIANT les gros blocs qui couvrent plus
calculateBlockScoreForFixedHeight(orientation, useWidth, maxWidth, requiredHeight, violatesJoints, blockThickness) {
    // 1. SCORE DE COUVERTURE (priorité absolue) - Plus le bloc couvre, mieux c'est
    const coverageScore = (useWidth / maxWidth) * 45; // 45% du score
    
    // 2. BONUS TAILLE ABSOLUE - Privilégier les gros blocs
    const absoluteSizeBonus = Math.min((useWidth / 1000) * 15, 15); // Bonus jusqu'à 15% pour les gros blocs
    
    // 3. BONUS "pas de découpe en largeur" - Mais moins important que la taille
    const noCutWidthBonus = (orientation.width <= maxWidth && orientation.width === useWidth) ? 20 : 0; // 20%
    
    // 4. BONUS "pas de découpe en hauteur"
    const noCutHeightBonus = (orientation.height === requiredHeight) ? 10 : 0; // 10%
    
    // 5. PÉNALITÉ pour petits blocs (< 500mm de largeur)
    const smallBlockPenalty = useWidth < 500 ? -10 : 0; // -10% pour les petits blocs
    
    // 6. BONUS efficacité matière (surface utilisée / surface totale du bloc)
    const blockArea = orientation.width * orientation.height;
    const usedArea = useWidth * requiredHeight;
    const efficiencyBonus = (usedArea / blockArea) * 5; // 5% max
    
    // 7. BONUS "pas de découpe en épaisseur"
    const noCutThicknessBonus = (blockThickness <= this.target.thickness) ? 5 : 0;
    
    // 8. PÉNALITÉ FORTE pour violation de jointures
    const jointPenalty = violatesJoints ? -30 : 0; // -30%
    
    const totalScore = coverageScore + absoluteSizeBonus + noCutWidthBonus + noCutHeightBonus 
                      + smallBlockPenalty + efficiencyBonus + noCutThicknessBonus + jointPenalty;
    
    return Math.max(0, totalScore);
}
// Placer un bloc avec une hauteur EXACTE imposée
placeBlockWithFixedHeight(bestBlock, x, y, maxWidth, fixedHeight, rowNumber) {
    const useWidth = Math.min(bestBlock.useWidth, maxWidth);
    const useHeight = fixedHeight; // ⚠️ HAUTEUR IMPOSÉE
    const useThickness = Math.min(bestBlock.thickness, this.target.thickness);
    
    // Calculer les découpes nécessaires
    let cuts = 0;
    const cutDetails = [];
    
    // Découpe en largeur
    const originalWidth = bestBlock.rotated ? bestBlock.width : bestBlock.length;
    if (originalWidth > useWidth) {
        cuts++;
        cutDetails.push(`Largeur: ${originalWidth}→${useWidth}mm`);
    }
    
    // Découpe en hauteur
    const originalHeight = bestBlock.rotated ? bestBlock.length : bestBlock.width;
    if (originalHeight > useHeight) {
        cuts++;
        cutDetails.push(`Hauteur: ${originalHeight}→${useHeight}mm`);
    }
    
    // Découpe en épaisseur
    if (bestBlock.thickness > this.target.thickness) {
        cuts++;
        cutDetails.push(`Épaisseur: ${bestBlock.thickness}→${this.target.thickness}mm`);
    }
    
    // Calculer le volume de chute
    const originalVolume = bestBlock.length * bestBlock.width * bestBlock.thickness;
    const usedVolume = useWidth * useHeight * useThickness;
    const wasteVolume = originalVolume - usedVolume;
    
    return {
        ref: bestBlock.ref,
        family: bestBlock.family || 'N/A',
        quality: bestBlock.quality || 'N/A',
        x: x,
        y: y,
        width: useWidth,
        height: useHeight, // ⚠️ HAUTEUR UNIFORME
        thickness: useThickness,
        originalLength: bestBlock.length,
        originalWidth: bestBlock.width,
        originalThickness: bestBlock.thickness,
        rotated: bestBlock.rotated,
        cuts: cuts,
        cutDetails: cutDetails,
        wasteVolume: wasteVolume,
        row: rowNumber,
        violatesJoints: bestBlock.violatesJoints || false
    };
}

// Trouver la hauteur optimale pour la rangée
// Trouver la hauteur optimale pour la rangée basée sur les blocs RÉELLEMENT disponibles
findOptimalRowHeight(targetHeight, minHeight, remainingWallHeight) {
    const availableBlocks = this.getAvailableBlocks();
    
    console.log(`🎯 Recherche hauteur optimale. Cible: ${targetHeight}mm, Min: ${minHeight}mm, Reste: ${remainingWallHeight}mm`);
    
    // Si c'est la dernière rangée possible, utiliser toute la hauteur restante
    if (remainingWallHeight <= targetHeight * 1.2) {
        console.log(`📏 Dernière rangée détectée, utilisation de toute la hauteur: ${remainingWallHeight}mm`);
        return remainingWallHeight;
    }
    
    // Collecter toutes les hauteurs possibles des blocs disponibles
    const possibleHeights = new Set();
    
    for (const block of availableBlocks) {
        if (this.currentStockAvailability[block.ref] <= 0) continue;
        
        // Tester les deux orientations du bloc
        const heightOptions = [block.width, block.length];
        
        for (const height of heightOptions) {
            // La hauteur doit être utilisable pour cette rangée
            if (height >= minHeight && height <= remainingWallHeight) {
                possibleHeights.add(height);
                console.log(`📦 Bloc ${block.ref}: hauteur possible ${height}mm`);
            }
        }
    }
    
    if (possibleHeights.size === 0) {
        console.log(`⚠️ Aucune hauteur possible trouvée, utilisation de la hauteur cible: ${targetHeight}mm`);
        return Math.min(targetHeight, remainingWallHeight);
    }
    
    // Convertir en array et trier
    const heightsArray = Array.from(possibleHeights);
    
    // STRATÉGIE : Privilégier les hauteurs qui permettent de bien remplir
    // 1. Hauteurs >= hauteur cible (pour avoir des rangées substantielles)
    // 2. Puis par proximité avec la hauteur cible
    const preferredHeights = heightsArray.filter(h => h >= targetHeight);
    
    let chosenHeight;
    if (preferredHeights.length > 0) {
        // Choisir la plus petite des hauteurs >= cible (éviter des rangées trop hautes)
        chosenHeight = Math.min(...preferredHeights);
    } else {
        // Sinon, prendre la plus grande hauteur disponible (même si < cible)
        chosenHeight = Math.max(...heightsArray);
    }
    
    console.log(`✅ Hauteur choisie: ${chosenHeight}mm (parmi ${heightsArray.join(', ')})`);
    return chosenHeight;
}

// Obtenir les blocs disponibles (stock > 0) depuis les blocs FILTRÉS
getAvailableBlocks() {
    return this.filteredStockData.filter(block => { // ← Utiliser filteredStockData au lieu de stockData
        const available = this.currentStockAvailability[block.ref] || 0;
        return available > 0;
    });
}

// Trouver le meilleur bloc avec rotation et gestion épaisseur
findBestBlock(maxWidth, targetHeight, currentX, forbiddenJoints) {
    const availableBlocks = this.getAvailableBlocks();
    let bestBlock = null;
    let bestScore = -1;

    for (const block of availableBlocks) {
        // ⚠️ GESTION ÉPAISSEUR : Accepter tous les blocs, découpe automatique si nécessaire
        // Pas de filtre sur l'épaisseur ici
        
        // Tester les deux orientations
        const orientations = [
            { width: block.length, height: block.width, rotated: false },
            { width: block.width, height: block.length, rotated: true }
        ];

        for (const orientation of orientations) {
            // Vérifier si le bloc rentre en hauteur (minimum 80% de la hauteur cible)
            if (orientation.height < targetHeight * this.minRowHeightRatio) continue;
            
            // Vérifier si le bloc peut être découpé pour rentrer en largeur
            const useWidth = Math.min(orientation.width, maxWidth);
            if (useWidth < 50) continue; // Pas de blocs trop petits (minimum 50mm)

            // Vérifier les contraintes de jointures
            const jointPosition = currentX + useWidth;
            const violatesJoints = this.violatesJointConstraint(jointPosition, forbiddenJoints);
            
            // Calculer le score : priorité aux blocs sans découpe puis couverture maximale
            const score = this.calculateBlockScore(
                orientation, 
                useWidth, 
                maxWidth, 
                targetHeight, 
                violatesJoints,
                block.thickness
            );

            if (score > bestScore) {
                bestScore = score;
                bestBlock = { 
                    ...block, 
                    useWidth: useWidth,
                    useHeight: Math.min(orientation.height, targetHeight), // Découpe possible en hauteur aussi
                    rotated: orientation.rotated,
                    violatesJoints: violatesJoints
                };
            }
        }
    }

    return bestBlock;
}
// Mettre à jour le stock global après utilisation
updateGlobalStock() {
    // Mettre à jour stockAvailability global avec les quantités locales
    Object.keys(this.currentStockAvailability).forEach(ref => {
        stockAvailability[ref] = this.currentStockAvailability[ref];
    });
    
    // Rafraîchir l'affichage du stock
    updateStockDisplay();
    
    console.log('📦 Stock global mis à jour');
}
// Calculer le score d'un bloc selon votre logique
calculateBlockScore(orientation, useWidth, maxWidth, targetHeight, violatesJoints, blockThickness) {
    // 1. Score de couverture X (priorité absolue)
    const coverageScore = (useWidth / maxWidth) * 50; // 50% du score
    
    // 2. Bonus "pas de découpe en largeur" (votre préférence)
    const noCutWidthBonus = (orientation.width <= maxWidth) ? 20 : 0; // 20% bonus
    
    // 3. Score de hauteur (proximité avec la hauteur cible)
    const heightRatio = Math.min(orientation.height / targetHeight, 1);
    const heightScore = heightRatio * 15; // 15% du score
    
    // 4. Bonus "pas de découpe en épaisseur"
    const noCutThicknessBonus = (blockThickness <= this.target.thickness) ? 10 : 0; // 10% bonus
    
    // 5. Pénalité pour violation de jointures
    const jointPenalty = violatesJoints ? -10 : 0;
    
    const totalScore = coverageScore + noCutWidthBonus + heightScore + noCutThicknessBonus + jointPenalty;
    
    return totalScore;
}

// Vérifier si une position viole les contraintes de jointures
violatesJointConstraint(jointPosition, forbiddenJoints) {
    if (jointPosition >= this.target.x) return false; // Fin du mur
    
    for (const forbiddenX of forbiddenJoints) {
        const distance = Math.abs(jointPosition - forbiddenX);
        if (distance < this.jointOffset) {
            return true;
        }
    }
    return false;
}
// Placer un bloc et calculer les découpes nécessaires
placeBlock(bestBlock, x, y, maxWidth, maxHeight, rowNumber) {
    const useWidth = Math.min(bestBlock.useWidth, maxWidth);
    const useHeight = Math.min(bestBlock.useHeight, maxHeight);
    const useThickness = Math.min(bestBlock.thickness, this.target.thickness); // ⚠️ DÉCOUPE ÉPAISSEUR
    
    // Calculer les découpes nécessaires
    let cuts = 0;
    const cutDetails = [];
    
    if (bestBlock.length > useWidth || bestBlock.width > useWidth) {
        cuts++;
        cutDetails.push(`Largeur: ${bestBlock.rotated ? bestBlock.width : bestBlock.length}→${useWidth}mm`);
    }
    
    if (bestBlock.width > useHeight || bestBlock.length > useHeight) {
        cuts++;
        cutDetails.push(`Hauteur: ${bestBlock.rotated ? bestBlock.length : bestBlock.width}→${useHeight}mm`);
    }
    
    if (bestBlock.thickness > this.target.thickness) { // ⚠️ DÉCOUPE ÉPAISSEUR
        cuts++;
        cutDetails.push(`Épaisseur: ${bestBlock.thickness}→${this.target.thickness}mm`);
    }
    
    // Calculer le volume de chute
    const originalVolume = bestBlock.length * bestBlock.width * bestBlock.thickness;
    const usedVolume = useWidth * useHeight * useThickness;
    const wasteVolume = originalVolume - usedVolume;
    
    return {
        ref: bestBlock.ref,
        family: bestBlock.family || 'N/A',
        quality: bestBlock.quality || 'N/A',
        x: x,
        y: y,
        width: useWidth,
        height: useHeight,
        thickness: useThickness,
        originalLength: bestBlock.length,
        originalWidth: bestBlock.width,
        originalThickness: bestBlock.thickness,
        rotated: bestBlock.rotated,
        cuts: cuts,
        cutDetails: cutDetails,
        wasteVolume: wasteVolume,
        row: rowNumber,
        violatesJoints: bestBlock.violatesJoints || false
    };
}
    // Valider le résultat et ajuster si nécessaire
validateAndAdjustResult() {
    const actualCoverage = this.calculateActualCoverage();
    const violationCount = this.solution.filter(b => b.violatesJoints).length;
    
    console.log(`📊 Résultat final: ${actualCoverage.toFixed(1)}% de couverture, ${violationCount} violations`);
    
    // Si la couverture est faible, suggérer des améliorations
    if (actualCoverage < 90) {
        console.log('💡 Suggestions pour améliorer la couverture:');
        console.log('  - Augmenter le nombre de rangées cible');
        console.log('  - Réduire le décalage minimum des jointures');
        console.log('  - Vérifier la disponibilité des blocs');
    }
    
    // Si trop de violations, suggérer des ajustements
    if (violationCount > this.solution.length * 0.2) { // Plus de 20% de violations
        console.log('⚠️ Beaucoup de violations de jointures détectées');
        console.log('💡 Suggestions:');
        console.log('  - Augmenter la valeur de décalage minimum');
        console.log('  - Utiliser des blocs de dimensions plus variées');
    }
    
    return actualCoverage;
}

// Calculer la couverture réelle plus précisément
calculateActualCoverage() {
    if (this.solution.length === 0) return 0;
    
    const totalUsedArea = this.solution.reduce((sum, block) => 
        sum + (block.width * block.height), 0
    );
    const wallArea = this.target.x * this.target.y;
    
    return (totalUsedArea / wallArea) * 100;
}
}
        
        function enrichBlocksWithOriginalDimensions(blocks, stockData) {
    return blocks.map(block => {
        // Trouver le casier original dans le stock
        const originalStock = stockData.find(stock => stock.ref === block.ref);
        
        if (originalStock) {
            return {
                ...block,
                originalLength: originalStock.length,
                originalWidth: originalStock.width,
                thickness: originalStock.thickness || block.thickness
            };
        }
        
        return block;
    });
}
        function calculateRealCoverage(blocks, targetLength, targetWidth) {
            if (!blocks || blocks.length === 0) return 0;

            const gridResolution = 10;
            const gridWidth = Math.ceil(targetLength / gridResolution);
            const gridHeight = Math.ceil(targetWidth / gridResolution);

            const grid = Array(gridHeight).fill().map(() => Array(gridWidth).fill(false));

            blocks.forEach(block => {
                const startX = Math.floor(block.x / gridResolution);
                const endX = Math.min(gridWidth - 1, Math.floor((block.x + block.width) / gridResolution));
                const startY = Math.floor(block.y / gridResolution);
                const endY = Math.min(gridHeight - 1, Math.floor((block.y + block.height) / gridResolution));

                for (let y = startY; y <= endY; y++) {
                    for (let x = startX; x <= endX; x++) {
                        grid[y][x] = true;
                    }
                }
            });

            let coveredPoints = 0;
            let totalPoints = 0;

            for (let y = 0; y < gridHeight; y++) {
                for (let x = 0; x < gridWidth; x++) {
                    const realX = x * gridResolution;
                    const realY = y * gridResolution;

                    if (realX < targetLength && realY < targetWidth) {
                        totalPoints++;
                        if (grid[y][x]) {
                            coveredPoints++;
                        }
                    }
                }
            }

            return totalPoints > 0 ? Math.round((coveredPoints / totalPoints) * 1000) / 10 : 0;
        }

        function displayResults(result) {
            const targetLength = Number(document.getElementById('targetLength').value);
            const targetWidth = Number(document.getElementById('targetWidth').value);
            const realCoverage = calculateRealCoverage(result.blocks, targetLength, targetWidth);

            let statusMessage = '';
            let statusClass = '';

            if (result.error) {
                statusClass = 'alert alert-danger';
                statusMessage = '❌ ' + result.error;
            } else if (realCoverage >= 100) {
                const adaptation = result.targetRows ?
                    (result.numRows === result.targetRows ?
                        result.numRows + ' rangées' :
                        result.numRows + ' rangées (prévu: ' + result.targetRows + ')') :
                    result.numRows + ' rangées';

                if (result.jointViolations && result.jointViolations > 0) {
                    statusMessage = `⚠️ Mur couvert avec ${adaptation} mais ${result.jointViolations} violations de jointures`;
                    statusClass = 'alert alert-warning';
                } else {
                    statusMessage = `✅ Mur parfaitement couvert avec ${adaptation} et jointures décalées ! Efficacité: ${result.efficiency}%`;
                    statusClass = 'alert alert-success';
                }
            } else if (realCoverage >= 95) {
                statusMessage = `⚠️ Couverture ${realCoverage}% - Adaptation incomplète`;
                statusClass = 'alert alert-warning';
            } else {
                statusMessage = `❌ Couverture ${realCoverage}% - Échec d\'optimisation`;
                statusClass = 'alert alert-danger';
            }

            document.getElementById('status').textContent = statusMessage;
            document.getElementById('status').className = statusClass;

            updateStats(result);
            visualizeWall(result.blocks);
            displayBlocksList(result.blocks);
        }

        function updateStats(result) {
    const targetLength = Number(document.getElementById('targetLength').value);
    const targetWidth = Number(document.getElementById('targetWidth').value);
    const realCoverage = calculateRealCoverage(result.blocks, targetLength, targetWidth);

    document.getElementById('blocksUsed').textContent = result.blocks.length;
    document.getElementById('cutsNeeded').textContent = result.totalCuts;
    document.getElementById('jointViolations').textContent = result.jointViolations || 0;
    document.getElementById('coverage').textContent = realCoverage + '%';
    
    // AFFICHAGE EN M³ avec formatage propre
    const wasteVolumeM3 = Math.round((result.totalWasteVolume / 1e9) * 100) / 100;
    const wallVolumeM3 = Math.round((result.wallVolume / 1e9) * 100) / 100;
    
    document.getElementById('wasteVolume').textContent = wasteVolumeM3.toFixed(2) + ' m³';
    document.getElementById('wallVolume').textContent = wallVolumeM3.toFixed(2) + ' m³';
    
    document.getElementById('rowsCreated').textContent = result.numRows + (result.targetRows ? ' (cible: ' + result.targetRows + ')' : '');
    document.getElementById('efficiency').textContent = (result.efficiency || 0) + '%';
}
// Formater les volumes intelligemment
        function formatVolume(volumeMm3) {
            if (volumeMm3 >= 1e6) {
             // Afficher en m³
                const volumeM3 = volumeMm3 / 1e9;
                return volumeM3.toFixed(2) + ' m³';
            } else {
            // Afficher en mm³ pour les petits volumes
            return Math.round(volumeMm3).toLocaleString() + ' mm³';
            }
        }
        function visualizeWall(blocks) {
            const container = document.getElementById('wallBlocks');
            container.innerHTML = '';

            const targetLength = Number(document.getElementById('targetLength').value);
            const targetWidth = Number(document.getElementById('targetWidth').value);

            const containerWidth = 280;
            const containerHeight = 250;
            const scaleX = containerWidth / targetLength;
            const scaleY = containerHeight / targetWidth;
            const scale = Math.min(scaleX, scaleY) * 0.8;

            const offsetX = 20;
            const offsetY = 20;

            // Wall outline
            const wallRect = document.createElement('div');
            wallRect.style.cssText = `position: absolute; left: ${offsetX}px; top: ${offsetY}px; 
                width: ${targetLength * scale}px; height: ${targetWidth * scale}px; 
                border: 3px solid #e74c3c; background: rgba(255, 235, 238, 0.8); 
                z-index: 1; box-shadow: 0 2px 8px rgba(0,0,0,0.15);`;
            wallRect.title = `Mur cible: ${targetLength}×${targetWidth}mm`;
            container.appendChild(wallRect);

            if (blocks && blocks.length > 0) {
                const rowsJoints = {};

                // Draw blocks
                blocks.forEach(block => {
                    const blockDiv = document.createElement('div');
                    blockDiv.className = 'block';
                    blockDiv.style.left = (offsetX + block.x * scale) + 'px';
                    blockDiv.style.top = (offsetY + block.y * scale) + 'px';
                    blockDiv.style.width = (block.width * scale) + 'px';
                    blockDiv.style.height = (block.height * scale) + 'px';
                    blockDiv.style.zIndex = '2';

                    let hue;
                    if (block.violatesJoints) {
                        hue = 0; // Red for violations
                    } else if (block.cuts === 0) {
                        hue = 120; // Green for no cuts
                    } else if (block.cuts <= 2) {
                        hue = 60; // Yellow for few cuts
                    } else {
                        hue = 30; // Orange for many cuts
                    }

                    blockDiv.style.background = `hsl(${hue}, 70%, 50%)`;
                    blockDiv.style.border = block.violatesJoints ? '2px solid #c0392b' : '1px solid #333';
                    blockDiv.textContent = block.ref;

                    const jointStatus = block.violatesJoints ? '\n⚠️ VIOLE JOINTURES' : '\n✅ JOINTURES OK';
                    blockDiv.title = `${block.ref} - Rangée ${block.row}\n${block.width}×${block.height}×${block.thickness}mm\nPosition: (${block.x}, ${block.y})\nDécoupes: ${block.cuts}${jointStatus}`;
                    
                    container.appendChild(blockDiv);

                    // Collect joint positions
                    if (!rowsJoints[block.row]) {
                        rowsJoints[block.row] = [];
                    }
                    const jointX = block.x + block.width;
                    if (jointX < targetLength) {
                        rowsJoints[block.row].push({
                            x: jointX,
                            y: block.y,
                            height: block.height,
                            violates: block.violatesJoints
                        });
                    }
                });

                // Draw joint lines
                Object.entries(rowsJoints).forEach(([rowNum, joints]) => {
                    joints.forEach(joint => {
                        const jointLine = document.createElement('div');
                        jointLine.style.cssText = `position: absolute; left: ${offsetX + joint.x * scale - 1}px; 
                            top: ${offsetY + joint.y * scale}px; width: 2px; height: ${joint.height * scale}px; 
                            background: ${joint.violates ? '#e74c3c' : '#2c3e50'}; z-index: 3; opacity: 0.8;`;
                        jointLine.title = `Jointure rangée ${rowNum} à X=${joint.x}mm${joint.violates ? ' (VIOLE CONTRAINTE)' : ''}`;
                        container.appendChild(jointLine);
                    });
                });
            }

            // Coverage display
            const realCoverage = calculateRealCoverage(blocks, targetLength, targetWidth);
            const coverageDisplay = document.getElementById('coverageDisplay');
            coverageDisplay.textContent = realCoverage + '%';
            coverageDisplay.style.background = realCoverage >= 100 ? '#27ae60' : realCoverage >= 95 ? '#f39c12' : '#e74c3c';

            // Dimensions label
            const dimensions = document.createElement('div');
            dimensions.style.cssText = `position: absolute; top: ${offsetY - 20}px; left: ${offsetX}px; 
                font-size: 12px; font-weight: 600; color: #2c3e50; z-index: 3;`;
            dimensions.textContent = `${targetLength} × ${targetWidth} mm`;
            container.appendChild(dimensions);

            // Legend
            const legend = document.createElement('div');
            legend.style.cssText = `position: absolute; bottom: 5px; left: 5px; font-size: 10px; 
                color: #666; z-index: 3; background: rgba(255,255,255,0.9); padding: 5px; border-radius: 3px;`;
            legend.innerHTML = `<div><strong>Jointures décalées (min ${document.getElementById('jointOffset').value}mm)</strong></div>
                <div>🟢 Sans découpe • 🟡 1-2 découpes • 🟠 3+ découpes</div>
                <div>🔴 Viole contraintes jointures</div>
                <div>━ Lignes de jointures (noires=OK, rouges=violations)</div>`;
            container.appendChild(legend);

            // Mouse tracking
            setupMouseTracking(container, targetLength, targetWidth, offsetX, offsetY, scale);
        }

        function setupMouseTracking(container, targetLength, targetWidth, offsetX, offsetY, scale) {
            const cursor = document.getElementById('cursor');
            const coordinates = document.getElementById('coordinates');

            container.addEventListener('mousemove', function(e) {
                const rect = container.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;
                
                const x = (mouseX - offsetX) / scale;
                const y = (mouseY - offsetY) / scale;

                if (x >= 0 && x <= targetLength && y >= 0 && y <= targetWidth) {
                    cursor.style.left = mouseX + 'px';
                    cursor.style.top = mouseY + 'px';
                    cursor.style.display = 'block';
                    coordinates.textContent = `X: ${Math.round(x)}, Y: ${Math.round(y)}`;
                } else {
                    cursor.style.display = 'none';
                }
            });

            container.addEventListener('mouseleave', function() {
                cursor.style.display = 'none';
            });
        }


        function displayBlocksList(blocks) {
            const container = document.getElementById('blocksList');
            const groups = {};

            // Grouper les blocs par référence
            blocks.forEach(block => {
            if (!groups[block.ref]) {
                groups[block.ref] = {
                    count: 0,
                    cuts: 0,
                    waste: 0,
                    rows: [],
                    family: block.family || 'N/A',
                    quality: block.quality || 'N/A',
                    supplier: block.supplier || 'N/A',
                    violations: 0,
                    hasCuts: false,
                    cutDetails: []
                };
            }
            groups[block.ref].count++;
            groups[block.ref].cuts += block.cuts;
            groups[block.ref].waste += block.wasteVolume;
            if (block.row && !groups[block.ref].rows.includes(block.row)) {
                groups[block.ref].rows.push(block.row);
            }
            if (block.violatesJoints) groups[block.ref].violations++;
        
             // Détail des découpes pour ce bloc
            if (block.cuts > 0) {
                groups[block.ref].hasCuts = true;
                const hasLengthCut = block.originalLength && block.width < block.originalLength;
                const hasWidthCut = block.originalWidth && block.height < block.originalWidth;
            
                groups[block.ref].cutDetails.push({
                    original: `${block.originalLength || 0}×${block.originalWidth || 0}`,
                    used: `${block.width}×${block.height}`,
                    type: hasLengthCut && hasWidthCut ? 'L+l' : hasLengthCut ? 'L' : 'l'
                });
            }
            });

            let html = '';
            Object.entries(groups).forEach(([ref, data]) => {
            const rowsList = data.rows.sort((a, b) => a - b).join(', ');
            const violationText = data.violations > 0 ?
                ` • ⚠️ ${data.violations} violations jointures` :
                ' • ✅ Jointures OK';

             // Détail des découpes pour ce casier
            const cutDetailsText = data.hasCuts ? 
                ` • Découpes: ${data.cutDetails.map(c => `${c.original}→${c.used}(${c.type})`).join(', ')}` : 
                ' • Bloc entier';

            const itemStyle = data.violations > 0 ?
                'padding: 8px; border-bottom: 1px solid #ddd; background: #fff3cd; margin-bottom: 3px; border-left: 3px solid #ffc107;' :
                'padding: 8px; border-bottom: 1px solid #ddd; background: #f9f9f9; margin-bottom: 3px;';

            html += `<div style="${itemStyle}">
                <div style="display: flex; justify-content: space-between;"><strong>${ref}</strong><span>×${data.count}</span></div>
                <div style="font-size: 0.8rem; color: #666;">${data.family} • ${data.quality} • ${data.supplier}</div>
                <div style="font-size: 0.8rem; color: #666;">Rangées : ${rowsList}${cutDetailsText}</div>
                <div style="font-size: 0.8rem; color: #666;">Découpes : ${data.cuts} | Chutes : ${formatVolume(data.waste)}${violationText}</div>
            </div>`;
            });

            container.innerHTML = html;

        // Ajouter le bouton pour voir les détails des découpes
            const detailButton = document.createElement('button');
            detailButton.style.cssText = `
                width: 100%; margin-top: 10px; padding: 8px; 
                background: #3498db; color: white; border: none; 
                border-radius: 5px; cursor: pointer; font-size: 0.9rem;
            `;
            detailButton.textContent = '✂️ Voir Détail des Découpes';
            detailButton.onclick = showCuttingDetails;
            container.appendChild(detailButton);

        // Summary existant (votre code)
            const totalWaste = Object.values(groups).reduce((sum, data) => sum + data.waste, 0);
            const totalCuts = Object.values(groups).reduce((sum, data) => sum + data.cuts, 0);
            const totalViolations = Object.values(groups).reduce((sum, data) => sum + data.violations, 0);
            const families = [...new Set(Object.values(groups).map(data => data.family))];

            const summary = document.createElement('div');
            const summaryColor = totalViolations > 0 ? '#ffc107' : '#27ae60';
            summary.style.cssText = `margin-top: 10px; padding: 10px; background: ${summaryColor}; 
                color: white; border-radius: 6px; text-align: center;`;

            const jointStatus = totalViolations === 0 ?
                '✅ JOINTURES PARFAITES' :
                `⚠️ ${totalViolations} VIOLATIONS JOINTURES`;

            const minOffset = document.getElementById('jointOffset').value;
            summary.innerHTML = `<strong>${jointStatus}</strong><br>
                <div style="margin-top: 5px; font-size: 0.9rem;">
                    ${Object.keys(groups).length} casiers • ${blocks.length} blocs total<br>
                    ${families.length} familles • ${totalCuts} découpes
                </div>
                <div style="margin-top: 5px; font-size: 0.9rem;">  
                    ${formatVolume(totalWaste)}chutes<br>
                    <small>Décalage minimum: ${minOffset}mm entre joints verticaux</small>
                </div>`;
            container.appendChild(summary);
        }

        console.log('✅ Système de détail des découpes ajouté');

        function exportToPDF() {
            if (!lastOptimizationResult || !lastOptimizationResult.blocks) {
                alert('Aucun résultat à exporter. Lancez d\'abord une optimisation.');
                return;
            }

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            const targetLength = Number(document.getElementById('targetLength').value);
            const targetWidth = Number(document.getElementById('targetWidth').value);
            const targetThickness = Number(document.getElementById('targetThickness').value);
            const realCoverage = calculateRealCoverage(lastOptimizationResult.blocks, targetLength, targetWidth);
            
            // Header
            doc.setFontSize(18);
            doc.text('Rapport d\'Optimisation - Mur Réfractaire', 20, 20);

            doc.setFontSize(12);
            const date = new Date().toLocaleDateString('fr-FR');
            doc.text('Généré le ' + date, 20, 30);

            // Configuration
            doc.setFontSize(14);
            doc.text('Configuration du Mur', 20, 50);
            doc.setFontSize(12);
            doc.text(`Dimensions: ${targetLength} × ${targetWidth} × ${targetThickness} mm`, 20, 60);

            // Results
            doc.setFontSize(14);
            doc.text('Résultats avec Jointures Décalées', 20, 90);
            doc.setFontSize(12);
            doc.text(`Couverture: ${realCoverage}%`, 20, 100);
            doc.text(`Efficacité: ${lastOptimizationResult.efficiency || 'N/A'}%`, 20, 110);
            doc.text(`Casiers utilisés: ${lastOptimizationResult.blocks.length}`, 20, 120);
            doc.text(`Rangées créées: ${lastOptimizationResult.numRows}`, 20, 130);
            doc.text(`Découpes totales: ${lastOptimizationResult.totalCuts}`, 20, 140);
            doc.text(`Violations de jointures: ${lastOptimizationResult.jointViolations || 0}`, 20, 150);

            // New page for wall plan
            doc.addPage();
            doc.setFontSize(16);
            doc.text('Plan de Disposition des Blocs', 20, 20);

            // Draw wall plan
            const planStartX = 20;
            const planStartY = 40;
            const planMaxWidth = 170;
            const planMaxHeight = 200;

            const scaleX = planMaxWidth / targetLength;
            const scaleY = planMaxHeight / targetWidth;
            const scale = Math.min(scaleX, scaleY);

            const planWidth = targetLength * scale;
            const planHeight = targetWidth * scale;

            // Wall outline
            doc.setDrawColor(255, 0, 0);
            doc.setLineWidth(1);
            doc.rect(planStartX, planStartY, planWidth, planHeight);

            // Dimensions
            doc.setFontSize(10);
            doc.text(`${targetLength}mm`, planStartX + planWidth/2 - 10, planStartY - 5);
            doc.text(`${targetWidth}mm`, planStartX - 15, planStartY + planHeight/2);

            // Draw blocks
            const colors = ['#27ae60', '#f39c12', '#e74c3c', '#3498db', '#9b59b6', '#1abc9c'];
            const familyColors = {};
            let colorIndex = 0;

            lastOptimizationResult.blocks.forEach(block => {
                if (!familyColors[block.family]) {
                    familyColors[block.family] = colors[colorIndex % colors.length];
                    colorIndex++;
                }

                const blockX = planStartX + (block.x * scale);
                const blockY = planStartY + (block.y * scale);
                const blockWidth = block.width * scale;
                const blockHeight = block.height * scale;

                doc.setFillColor(familyColors[block.family] || '#95a5a6');
                doc.setDrawColor(0, 0, 0);
                doc.setLineWidth(0.2);
                doc.rect(blockX, blockY, blockWidth, blockHeight, 'FD');

                if (blockWidth > 15 && blockHeight > 8) {
                    doc.setFontSize(8);
                    doc.setTextColor(255, 255, 255);
                    const textX = blockX + blockWidth/2;
                    const textY = blockY + blockHeight/2 + 2;
                    doc.text(block.ref, textX, textY, { align: 'center' });
                }
            });

            // Legend
            let legendY = planStartY + planHeight + 20;
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            doc.text('Légende des Familles:', 20, legendY);
            
            legendY += 10;
            Object.entries(familyColors).forEach(([family, color]) => {
                doc.setFillColor(color);
                doc.rect(20, legendY - 3, 8, 6, 'F');
                doc.setFontSize(10);
                doc.text(family, 32, legendY + 1);
                legendY += 10;
            });
		 // Nouvelle page pour les détails des casiers
            doc.addPage();
            doc.setFontSize(16);
            doc.text('Détail des Casiers Utilisés', 20, 20);
            doc.setFontSize(10);

            const groups = {};
            lastOptimizationResult.blocks.forEach(block => {
                if (!groups[block.ref]) {
                    groups[block.ref] = {
                        count: 0, 
                        cuts: 0, 
                        waste: 0, 
                        rows: new Set(),
                        family: block.family || 'N/A',
                        quality: block.quality || 'N/A'
                    };
                }
                groups[block.ref].count++;
                groups[block.ref].cuts += block.cuts;
                groups[block.ref].waste += block.wasteVolume;
                groups[block.ref].rows.add(block.row);
            });

            let yPos = 40;
            doc.text('Casier | Famille | Qualité | Qté | Rangées | Découpes | Chutes (mm³)', 20, yPos);
            yPos += 5;
            doc.line(20, yPos, 190, yPos);
            yPos += 10;

            Object.entries(groups).forEach(([ref, data]) => {
                if (yPos > 270) {
                    doc.addPage();
                    yPos = 20;
                }
                const rowsList = Array.from(data.rows).sort().join(', ');
                const wasteVolume = Math.round(data.waste);
                const line = `${ref} | ${data.family} | ${data.quality} | x${data.count} | ${rowsList} | ${data.cuts} | ${wasteVolume} mm³`;
                doc.text(line, 20, yPos);
                yPos += 8;
            });
            doc.save(`optimisation_mur_jointures_${targetLength}x${targetWidth}x${targetThickness}_${date.replace(/\//g, '-')}.pdf`);
        }

        function exportToCSV() {
            // Function removed as requested
        }

        // Event listeners
        ['targetLength', 'targetWidth', 'targetThickness', 'numRows', 'jointOffset'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', updateStockDisplay);
            }
        });

        ['familyFilter', 'qualityFilter'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', updateStockDisplay);
            }
        });

        // Excel file import
        const excelFileInput = document.getElementById('excelFile');
        if (excelFileInput) {
            excelFileInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (!file) return;

                showStatus('info', 'Import en cours...');

                const reader = new FileReader();
                reader.onload = function(e) {
                    try {
                        const data = new Uint8Array(e.target.result);
                        const workbook = XLSX.read(data, {type: 'array'});
                        const sheet = workbook.Sheets[workbook.SheetNames[0]];
                        const rows = XLSX.utils.sheet_to_json(sheet, {header: 1});

                        stockData = parseStockData(rows);
                        // CORRECTION ESSENTIELLE : Initialiser les objets de stock
                        originalStockQuantities = {};
                        stockAvailability = {};

                        stockData.forEach(item => {
                        originalStockQuantities[item.ref] = item.quantity;
                        stockAvailability[item.ref] = item.quantity;
                    });

                        console.log('📦 Initialisation stock après Excel - Premiers éléments:');
                        stockData.slice(0, 3).forEach(item => {
                            console.log(`  ${item.ref}: quantity=${item.quantity}, originalStock=${originalStockQuantities[item.ref]}`);
                    });
                        updateFilters();
                        updateStockDisplay();

                        showStatus('success', `✅ ${stockData.length} casiers importés avec succès`);
                    } catch (error) {
                        showStatus('danger', `❌ Erreur d'import: ${error.message}`);
                        console.error('Import error:', error);
                    }
                };
                reader.readAsArrayBuffer(file);
            });
        }

        function parseStockData(rows) {
            if (rows.length < 4) throw new Error('Fichier vide ou structure incorrecte');

            let headerRowIndex = -1;
            for (let i = 0; i < rows.length; i++) {
                if (rows[i] && Array.isArray(rows[i])) {
                    for (let j = 0; j < rows[i].length; j++) {
                        const cell = rows[i][j];
                        if (cell && String(cell).toUpperCase().includes('CASIER')) {
                            headerRowIndex = i;
                            break;
                        }
                    }
                    if (headerRowIndex >= 0) break;
                }
            }

            if (headerRowIndex === -1) throw new Error('En-têtes non trouvés');

            const headers = [];
            for (let i = 0; i < rows[headerRowIndex].length; i++) {
                headers[i] = String(rows[headerRowIndex][i] || '').toUpperCase();
            }

            function findCol(names) {
                for (let i = 0; i < names.length; i++) {
                    for (let j = 0; j < headers.length; j++) {
                        if (headers[j] && headers[j].includes(names[i])) {
                            return j;
                        }
                    }
                }
                return -1;
            }

            const columnMap = {
                ref: findCol(['CASIER']),
                family: findCol(['FAMILLE']),
                quality: findCol(['QUALITÉ', 'QUALITE']),
                supplier: findCol(['QUALITÉ FOURNISSEUR','FOURNISSEUR','FOURNISSEUR','FOURNI']),
                length: findCol(['LONGUEUR','LONG']),
                width: findCol(['LARGEUR','LARG']),
                thickness: findCol(['ÉPAISSEUR', 'EPAISSEUR','EPAI']),
                quantity: findCol(['STOCK','QUANTITÉ','QUANTITE','QTE','qte','Stock'])
            };

            const missing = [];
            for (const key in columnMap) {
                if (columnMap[key] === -1 && key !== 'quantity') {
                    missing.push(key);
                }
            }
            if (missing.length) throw new Error('Colonnes manquantes: ' + missing.join(', '));

            const parsedData = [];
            for (let i = headerRowIndex + 1; i < rows.length; i++) {
                const row = rows[i];
                if (!row || !Array.isArray(row) || row.length === 0) continue;

                try {
                    const item = {
                        ref: String(row[columnMap.ref] || '').trim(),
                        family: String(row[columnMap.family] || '').trim(),
                        quality: String(row[columnMap.quality] || '').trim(),
                        supplier: String(row[columnMap.supplier] || '').trim(),
                        length: Number(row[columnMap.length]) || 0,
                        width: Number(row[columnMap.width]) || 0,
                        thickness: Number(row[columnMap.thickness]) || 0,
                        quantity: columnMap.quantity >= 0 ? this.parseStockQuantity(row[columnMap.quantity]) : 10000
                    };

                    if (item.ref && item.length > 0 && item.width > 0 && item.thickness > 0) {
                        parsedData.push(item);
                    }
                } catch (error) {
                    console.warn('Erreur ligne ' + (i + 1) + ':', error);
                }
            }
            // DEBUG: Vérifier les quantités parsées
                console.log('📊 Vérification des stocks parsés:');
                const stockSummary = parsedData.reduce((summary, item) => {
                    summary.total++;
                    if (item.quantity > 0) summary.withStock++;
                    else summary.withoutStock++;
                return summary;
            } , { total: 0, withStock: 0, withoutStock: 0 });

            console.log(`Total: ${stockSummary.total} articles, Avec stock: ${stockSummary.withStock}, Sans stock: ${stockSummary.withoutStock}`);

            // Afficher quelques exemples
                parsedData.slice(0, 5).forEach(item => {
                console.log(`Exemple: ${item.ref} → ${item.quantity} unités`);
                });

                 console.log(parsedData.length + ' articles valides trouvés');
        return parsedData;
        }
        // Fonction pour parser les quantités avec unités (1 PC, 2 SAC, etc.)
function parseStockQuantity(stockCell) {
    if (!stockCell) return 0;
    
    const stockStr = String(stockCell).trim().toUpperCase();
    
    // Si c'est déjà un nombre pur
    if (!isNaN(stockStr) && stockStr !== '') {
        return parseInt(stockStr) || 0;
    }
    
    // Extraire le nombre avant l'unité (PC, SAC, UD, etc.)
    const patterns = [
        /^(\d+(?:[,\.]\d+)?)\s*(?:PC|SAC|UD|UL|KG|PIECES?|SACS?|UNITES?|LITRES?)?$/i,
        /^(\d+(?:[,\.]\d+)?)/  // Fallback: juste le premier nombre trouvé
    ];
    
    for (const pattern of patterns) {
        const match = stockStr.match(pattern);
        if (match) {
            const numberStr = match[1].replace(',', '.');
            const quantity = parseInt(numberStr) || 0;
            console.log(`📦 Stock parsé: "${stockCell}" → ${quantity}`);
            return quantity;
        }
    }
    
    console.warn(`⚠️ Stock non parsable: "${stockCell}" → 0`);
    return 0;
}
        // Initialize interface
        function initializeInterface() {
            updateStockDisplay();
            
            // Add keyboard shortcuts
            document.addEventListener('keydown', function(e) {
                if (e.ctrlKey || e.metaKey) {
                    switch(e.key) {
                        case 'Enter':
                            e.preventDefault();
                            optimizeWall();
                            break;
                        case 'r':
                            e.preventDefault();
                            if (lastOptimizationResult) {
                                displayResults(lastOptimizationResult);
                            }
                            break;
                    }
                }
            });

            // Add input validation
            const numberInputs = ['targetLength', 'targetWidth', 'targetThickness', 'numRows', 'jointOffset'];
            numberInputs.forEach(id => {
                const input = document.getElementById(id);
                if (input) {
                    input.addEventListener('blur', function() {
                        const min = parseFloat(this.min) || 0;
                        const max = parseFloat(this.max) || Infinity;
                        let value = parseFloat(this.value) || min;
                        
                        if (value < min) value = min;
                        if (value > max) value = max;
                        
                        this.value = value;
                        updateStockDisplay();
                    });
                }
            });

            console.log('🎯 Optimisateur de Murs Réfractaires - Version Améliorée');
            console.log('✅ Contraintes de jointures paramétrables');
            console.log('✅ Interface utilisateur améliorée');
            console.log('✅ Export PDF');
            console.log('✅ Validation des données renforcée');
            console.log('✅ Suivi de souris avec coordonnées');
            console.log('Raccourcis: Ctrl+Enter pour optimiser, Ctrl+R pour rafraîchir');
        }

        // Initialize when DOM is loaded
        document.addEventListener('DOMContentLoaded', function() {
            initializeInterface();
        });
    // ========================================================================

class SimpleOptimizationTracker {
    constructor() {
        this.init();
    }

    async init() {
        try {
            // Utiliser localStorage simple pour éviter les complications
            console.log('✅ Système de collecte simple initialisé');
        } catch (error) {
            console.error('❌ Erreur initialisation:', error);
        }
    }

    saveOptimization(wallConfig, result, stockData, optimizationTime) {
        try {
            const projects = JSON.parse(localStorage.getItem('wall_projects') || '[]');
            
            const projectData = {
                id: Date.now(),
                timestamp: new Date().toISOString(),
                wallConfig: wallConfig,
                result: {
                    coverage: result.coverage || 0,
                    efficiency: result.efficiency || 0,
                    totalCuts: result.totalCuts || 0,
                    jointViolations: result.jointViolations || 0,
                    numRows: result.numRows || 0,
                    wallVolume: result.wallVolume || 0,
                    totalWasteVolume: result.totalWasteVolume || 0
                },
                optimizationTime: optimizationTime,
                blocks: result.blocks || [],
                stockData: stockData || []
            };

            projects.push(projectData);
            
            // Garder seulement les 30 derniers projets
            if (projects.length > 30) {
                projects.splice(0, projects.length - 30);
            }

            localStorage.setItem('wall_projects', JSON.stringify(projects));
            console.log(`✅ Optimisation sauvegardée (${projects.length} projets total)`);
            
            return projectData.id;

        } catch (error) {
            console.error('❌ Erreur sauvegarde:', error);
            return null;
        }
    }

    getStats() {
        try {
            const projects = JSON.parse(localStorage.getItem('wall_projects') || '[]');
            
            if (!projects.length) {
                return { error: 'Aucun projet trouvé' };
            }

            const stats = {
                totalProjects: projects.length,
                avgCoverage: projects.reduce((sum, p) => sum + (p.result?.coverage || 0), 0) / projects.length,
                avgEfficiency: projects.reduce((sum, p) => sum + (p.result?.efficiency || 0), 0) / projects.length,
                avgCuts: projects.reduce((sum, p) => sum + (p.result?.totalCuts || 0), 0) / projects.length,
                avgViolations: projects.reduce((sum, p) => sum + (p.result?.jointViolations || 0), 0) / projects.length,
                avgTime: projects.reduce((sum, p) => sum + (p.optimizationTime || 0), 0) / projects.length
            };

            // Statistiques par famille
            const familyStats = {};
            projects.forEach(project => {
                (project.blocks || []).forEach(block => {
                    const family = block.family || 'N/A';
                    if (!familyStats[family]) {
                        familyStats[family] = { count: 0, totalWaste: 0 };
                    }
                    familyStats[family].count++;
                    familyStats[family].totalWaste += block.wasteVolume || 0;
                });
            });

            stats.topFamilies = Object.entries(familyStats)
                .map(([family, data]) => ({
                    family,
                    count: data.count,
                    avgWaste: data.totalWaste / data.count
                }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);

            return stats;

        } catch (error) {
            console.error('❌ Erreur récupération stats:', error);
            return { error: 'Erreur lors du calcul des statistiques' };
        }
    }

    exportData() {
        try {
            const projects = JSON.parse(localStorage.getItem('wall_projects') || '[]');
            
            const exportData = {
                projects: projects,
                exportDate: new Date().toISOString(),
                version: '1.0',
                totalProjects: projects.length
            };

            // Créer et télécharger le fichier JSON
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `optimisation_donnees_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);

            console.log('✅ Export terminé');
            return true;

        } catch (error) {
            console.error('❌ Erreur export:', error);
            return false;
        }
    }

    getSuggestions() {
        const stats = this.getStats();
        const suggestions = [];

        if (stats.error) {
            suggestions.push("📊 Pas encore de données collectées");
            return suggestions;
        }

        if (stats.totalProjects < 5) {
            suggestions.push("📈 Collectez plus de données pour des analyses pertinentes");
        }

        if (stats.avgCoverage < 95) {
            suggestions.push("🎯 Couverture moyenne: " + stats.avgCoverage.toFixed(1) + "% - Peut être améliorée");
        }

        if (stats.avgEfficiency < 80) {
            suggestions.push("⚡ Efficacité moyenne: " + stats.avgEfficiency.toFixed(1) + "% - Analysez les découpes");
        }

        if (stats.avgViolations > 1) {
            suggestions.push("🔗 Violations moyennes: " + stats.avgViolations.toFixed(1) + " - Ajustez les jointures");
        }

        if (suggestions.length === 0) {
            suggestions.push("✅ Bonnes performances générales !");
        }

        return suggestions;
    }
}

// Initialiser le tracker simple
const simpleTracker = new SimpleOptimizationTracker();

// ========================================
// NOTIFICATION DISCRÈTE
// ========================================

function showQuietNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed; bottom: 20px; right: 20px; 
        background: #27ae60; color: white; 
        padding: 8px 12px; border-radius: 4px; 
        font-size: 12px; z-index: 9999;
        opacity: 0; transition: opacity 0.3s ease;
        pointer-events: none;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animation d'apparition
    setTimeout(() => notification.style.opacity = '1', 100);
    
    // Disparition après 2 secondes
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 2000);
}

// ========================================
// AFFICHAGE DES STATISTIQUES SIMPLE
// ========================================

function showSimpleStats() {
    const stats = simpleTracker.getStats();
    const suggestions = simpleTracker.getSuggestions();
    
    if (stats.error) {
        alert('📊 Aucune donnée collectée pour le moment.\nRéalisez quelques optimisations pour voir vos statistiques !');
        return;
    }
    
    let message = '📊 VOS STATISTIQUES\n\n';
    message += `Projets réalisés: ${stats.totalProjects}\n`;
    message += `Couverture moyenne: ${stats.avgCoverage.toFixed(1)}%\n`;
    message += `Efficacité moyenne: ${stats.avgEfficiency.toFixed(1)}%\n`;
    message += `Découpes moyennes: ${stats.avgCuts.toFixed(1)}\n`;
    message += `Violations moyennes: ${stats.avgViolations.toFixed(1)}\n`;
    message += `Temps moyen: ${stats.avgTime.toFixed(1)}s\n\n`;
    
    if (stats.topFamilies.length > 0) {
        message += '🏆 FAMILLES LES PLUS UTILISÉES:\n';
        stats.topFamilies.forEach((family, index) => {
            message += `${index + 1}. ${family.family}: ${family.count} fois\n`;
        });
        message += '\n';
    }
    
    message += '💡 SUGGESTIONS:\n';
    suggestions.forEach(suggestion => {
        message += `• ${suggestion}\n`;
    });
    
    alert(message);
}

// ========================================
// EXPORT SIMPLE
// ========================================

function exportSimpleData() {
    const success = simpleTracker.exportData();
    if (success) {
        alert('✅ Données exportées avec succès !');
    } else {
        alert('❌ Erreur lors de l\'export');
    }
}

// ========================================
// AJOUT DES BOUTONS SIMPLES
// ========================================

function addSimpleButtons() {
    const section = document.querySelector('.section:nth-child(2)');
    if (!section) return;
    
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        margin-top: 15px; 
        padding-top: 15px; 
        border-top: 1px solid #ddd;
    `;
    
    buttonContainer.innerHTML = `
        <div style="margin-bottom: 10px;">
            <h4 style="color: #2c3e50; margin-bottom: 8px; font-size: 14px;">📊 Données d'Optimisation</h4>
        </div>
        <div class="btn-grid">
            <button class="btn btn-secondary" onclick="showSimpleStats()">
                📈 Mes Statistiques
            </button>
            <button class="btn btn-warning" onclick="exportSimpleData()">
                📥 Exporter Données
            </button>
        </div>
    `;
    
    section.appendChild(buttonContainer);
}


window.optimizeWall = optimizeWall;

// Initialiser au chargement
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initializeInterface, 500);
});

console.log('✅ Système de collecte simplifié chargé');
    // ========================================
// DÉTAIL DES DÉCOUPES - CODE À AJOUTER
// ========================================

// 1. FONCTION POUR CALCULER LES DÉTAILS DE DÉCOUPES
function calculateCuttingDetails(blocks) {
    const cuttingDetails = {
        totalBlocks: blocks.length,
        blocksWithCuts: 0,
        blocksWithoutCuts: 0,
        cutsByType: {
            lengthOnly: 0,
            widthOnly: 0,
            both: 0,
            none: 0
        },
        detailedCuts: [],
        totalWastePieces: 0,
        wasteByFamily: {}
    };

    blocks.forEach(block => {
        // Trouver le casier original dans le stock
        const originalStock = stockData.find(stock => stock.ref === block.ref);
        
        if (!originalStock) {
            console.warn(`Casier original ${block.ref} non trouvé dans le stock`);
            return;
        }

        // Dimensions originales
        const originalLength = originalStock.length;
        const originalWidth = originalStock.width;
        const originalThickness = originalStock.thickness;

        // Dimensions utilisées dans le mur
        const usedLength = block.width;  // Dans votre code, block.width est la longueur utilisée
        const usedWidth = block.height;  // block.height est la largeur utilisée
        const usedThickness = originalThickness; // L'épaisseur reste la même

        // Calculer les découpes nécessaires
        const needsCutLength = originalLength > usedLength;
        const needsCutWidth = originalWidth > usedWidth;
        const hasAnyCuts = needsCutLength || needsCutWidth;

        // Calculer les dimensions des chutes
        const wasteLength = needsCutLength ? originalLength - usedLength : 0;
        const wasteWidth = needsCutWidth ? originalWidth - usedWidth : 0;

        if (hasAnyCuts) {
            cuttingDetails.blocksWithCuts++;
            
            // Classifier le type de découpe
            if (needsCutLength && needsCutWidth) {
                cuttingDetails.cutsByType.both++;
            } else if (needsCutLength) {
                cuttingDetails.cutsByType.lengthOnly++;
            } else if (needsCutWidth) {
                cuttingDetails.cutsByType.widthOnly++;
            }

            // Calculer les chutes détaillées
            const wasteDetails = [];

            if (needsCutLength && wasteLength > 5) { // Ignorer les très petites chutes
                wasteDetails.push({
                    type: 'Chute longueur',
                    dimensions: `${wasteLength} × ${originalWidth} × ${originalThickness}`,
                    volume: wasteLength * originalWidth * originalThickness
                });
            }

            if (needsCutWidth && wasteWidth > 5) { // Ignorer les très petites chutes
                wasteDetails.push({
                    type: 'Chute largeur',
                    dimensions: `${usedLength} × ${wasteWidth} × ${originalThickness}`,
                    volume: usedLength * wasteWidth * originalThickness
                });
            }

            // Chute d'angle si découpe sur les deux dimensions
            if (needsCutLength && needsCutWidth && wasteLength > 5 && wasteWidth > 5) {
                wasteDetails.push({
                    type: 'Chute angle',
                    dimensions: `${wasteLength} × ${wasteWidth} × ${originalThickness}`,
                    volume: wasteLength * wasteWidth * originalThickness
                });
            }

            // Calculer le volume total de chutes
            const totalWasteVolume = wasteDetails.reduce((sum, waste) => sum + waste.volume, 0);
            
            // Détail de la découpe
            const cutDetail = {
                ref: block.ref,
                family: block.family || 'N/A',
                quality: block.quality || 'N/A',
                // Dimensions originales
                originalDimensions: `${originalLength} × ${originalWidth} × ${originalThickness}`,
                originalLength: originalLength,
                originalWidth: originalWidth,
                originalThickness: originalThickness,
                // Dimensions utilisées
                usedDimensions: `${usedLength} × ${usedWidth} × ${usedThickness}`,
                usedLength: usedLength,
                usedWidth: usedWidth,
                usedThickness: usedThickness,
                // Informations sur les découpes
                cutType: needsCutLength && needsCutWidth ? 'Longueur + Largeur' : 
                         needsCutLength ? 'Longueur seulement' : 'Largeur seulement',
                needsCutLength: needsCutLength,
                needsCutWidth: needsCutWidth,
                // Dimensions des chutes
                wasteLength: wasteLength,
                wasteWidth: wasteWidth,
                wasteDetails: wasteDetails,
                wasteVolume: totalWasteVolume,
                // Autres informations
                row: block.row,
                position: `(${block.x}, ${block.y})`,
                cuts: block.cuts || 0,
                violatesJoints: block.violatesJoints || false,
                efficiency: ((usedLength * usedWidth * usedThickness) / (originalLength * originalWidth * originalThickness)) * 100
            };
            
            cuttingDetails.detailedCuts.push(cutDetail);
            
            // Calculer les chutes par famille
            const family = block.family || 'N/A';
            if (!cuttingDetails.wasteByFamily[family]) {
                cuttingDetails.wasteByFamily[family] = {
                    totalWaste: 0,
                    blocksCount: 0
                };
            }
            cuttingDetails.wasteByFamily[family].totalWaste += totalWasteVolume;
            cuttingDetails.wasteByFamily[family].blocksCount++;
            
        } else {
            cuttingDetails.blocksWithoutCuts++;
            cuttingDetails.cutsByType.none++;
        }
    });

    cuttingDetails.totalWastePieces = cuttingDetails.blocksWithCuts;

    return cuttingDetails;
}
// 2. FONCTION POUR AFFICHER LES DÉTAILS DE DÉCOUPES
function showCuttingDetails() {
    if (!lastOptimizationResult || !lastOptimizationResult.blocks) {
        alert('Aucune optimisation disponible. Lancez d\'abord une optimisation.');
        return;
    }

    const details = calculateCuttingDetails(lastOptimizationResult.blocks);
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
        background: rgba(0,0,0,0.5); display: flex; align-items: center; 
        justify-content: center; z-index: 10000;
    `;
    
    // Construire le tableau des découpes AMÉLIORÉ
    let cutsTableHtml = '';
    if (details.detailedCuts.length > 0) {
        cutsTableHtml = `
            <div style="max-height: 400px; overflow-y: auto; border: 1px solid #ddd; border-radius: 6px; margin-top: 10px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 0.8rem;">
                    <thead style="background: #34495e; color: white; position: sticky; top: 0;">
                        <tr>
                            <th style="padding: 8px; text-align: left; min-width: 80px;">Casier</th>
                            <th style="padding: 8px; text-align: left; min-width: 80px;">Famille</th>
                            <th style="padding: 8px; text-align: left; min-width: 120px;">Dim. Originales</th>
                            <th style="padding: 8px; text-align: left; min-width: 120px;">Dim. Utilisées</th>
                            <th style="padding: 8px; text-align: left; min-width: 100px;">Type Découpe</th>
                            <th style="padding: 8px; text-align: left; min-width: 150px;">Chutes Générées</th>
                            <th style="padding: 8px; text-align: center; min-width: 60px;">Rangée</th>
                            <th style="padding: 8px; text-align: center; min-width: 80px;">Efficacité</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${details.detailedCuts.map(cut => {
                            // Construire le détail des chutes
                            let wastesText = '';
                            if (cut.wasteDetails.length > 0) {
                                wastesText = cut.wasteDetails.map(waste => 
                                    `<div style="margin-bottom: 2px;"><strong>${waste.type}:</strong> ${waste.dimensions}</div>`
                                ).join('');
                            } else {
                                wastesText = '<div style="color: #27ae60;">Aucune chute</div>';
                            }

                            const efficiencyColor = cut.efficiency >= 80 ? '#27ae60' : 
                                                   cut.efficiency >= 60 ? '#f39c12' : '#e74c3c';

                            return `
                                <tr style="border-bottom: 1px solid #eee;">
                                    <td style="padding: 8px; font-weight: 600; color: #2980b9;">${cut.ref}</td>
                                    <td style="padding: 8px; font-size: 0.75rem; color: #666;">${cut.family}</td>
                                    <td style="padding: 8px; font-family: monospace;">
                                        <div><strong>L:</strong> ${cut.originalLength}mm</div>
                                        <div><strong>l:</strong> ${cut.originalWidth}mm</div>
                                        <div><strong>É:</strong> ${cut.originalThickness}mm</div>
                                    </td>
                                    <td style="padding: 8px; font-family: monospace; color: #27ae60;">
                                        <div><strong>L:</strong> ${cut.usedLength}mm</div>
                                        <div><strong>l:</strong> ${cut.usedWidth}mm</div>
                                        <div><strong>É:</strong> ${cut.usedThickness}mm</div>
                                    </td>
                                    <td style="padding: 8px; color: ${cut.cutType.includes('+') ? '#e74c3c' : '#f39c12'};">
                                        <div style="font-weight: 600;">${cut.cutType}</div>
                                        ${cut.needsCutLength ? `<div style="font-size: 0.7rem;">✂️ L: -${cut.wasteLength}mm</div>` : ''}
                                        ${cut.needsCutWidth ? `<div style="font-size: 0.7rem;">✂️ l: -${cut.wasteWidth}mm</div>` : ''}
                                    </td>
                                    <td style="padding: 8px; font-size: 0.75rem;">
                                        ${wastesText}
                                        ${cut.wasteVolume > 0 ? `<div style="margin-top: 4px; color: #e74c3c; font-weight: 600;">Total: ${Math.round(cut.wasteVolume).toLocaleString()} mm³</div>` : ''}
                                    </td>
                                    <td style="padding: 8px; text-align: center; font-weight: 600;">${cut.row}</td>
                                    <td style="padding: 8px; text-align: center; color: ${efficiencyColor}; font-weight: 600;">${cut.efficiency.toFixed(1)}%</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } else {
        cutsTableHtml = `
            <div style="text-align: center; padding: 20px; background: #d4edda; border-radius: 6px; color: #155724; margin-top: 10px;">
                🎉 <strong>Aucune découpe nécessaire !</strong><br>
                Tous les blocs sont utilisés dans leurs dimensions originales.
            </div>
        `;
    }

    // Construire les statistiques des chutes par famille (inchangé)
    const wasteByFamilyHtml = Object.keys(details.wasteByFamily).length > 0 ? `
        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-top: 15px;">
            <h4 style="color: #856404; margin-bottom: 10px;">📊 Chutes par Famille</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.9rem;">
                ${Object.entries(details.wasteByFamily).map(([family, data]) => `
                    <div style="padding: 8px; background: white; border-radius: 4px; border-left: 3px solid #f39c12;">
                        <strong>${family}</strong><br>
                        <small>${data.blocksCount} blocs • ${Math.round(data.totalWaste).toLocaleString()} mm³</small>
                    </div>
                `).join('')}
            </div>
        </div>
    ` : '';

    modal.innerHTML = `
        <div style="background: white; padding: 25px; border-radius: 10px; max-width: 1200px; width: 95%; max-height: 90vh; overflow-y: auto;">
            <h3 style="margin-bottom: 20px; color: #2c3e50; display: flex; align-items: center; gap: 10px;">
                ✂️ Détail des Découpes
            </h3>
            
            <!-- Résumé des découpes (inchangé) -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
                <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 1.5rem; font-weight: bold; color: #2980b9;">${details.totalBlocks}</div>
                    <div style="font-size: 0.9rem; color: #666;">Blocs total</div>
                </div>
                <div style="background: #ffe6e6; padding: 15px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 1.5rem; font-weight: bold; color: #e74c3c;">${details.blocksWithCuts}</div>
                    <div style="font-size: 0.9rem; color: #666;">Blocs découpés</div>
                </div>
                <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 1.5rem; font-weight: bold; color: #27ae60;">${details.blocksWithoutCuts}</div>
                    <div style="font-size: 0.9rem; color: #666;">Blocs entiers</div>
                </div>
                <div style="background: #fff3cd; padding: 15px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 1.5rem; font-weight: bold; color: #f39c12;">${details.totalWastePieces}</div>
                    <div style="font-size: 0.9rem; color: #666;">Chutes créées</div>
                </div>
            </div>

            <!-- Types de découpes (inchangé) -->
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <h4 style="color: #2c3e50; margin-bottom: 10px;">📋 Types de Découpes</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; font-size: 0.9rem;">
                    <div>✂️ Longueur seule: <strong>${details.cutsByType.lengthOnly}</strong></div>
                    <div>✂️ Largeur seule: <strong>${details.cutsByType.widthOnly}</strong></div>
                    <div>✂️ Les deux: <strong>${details.cutsByType.both}</strong></div>
                    <div>✅ Aucune: <strong>${details.cutsByType.none}</strong></div>
                </div>
            </div>

            <!-- Tableau détaillé AMÉLIORÉ -->
            <div>
                <h4 style="color: #2c3e50; margin-bottom: 10px;">🔍 Détail des Découpes par Bloc</h4>
                <div style="background: #e8f4fd; padding: 10px; border-radius: 6px; margin-bottom: 10px; font-size: 0.85rem;">
                    <strong>💡 Légende:</strong> 
                    Dim. Originales = taille du casier en stock • 
                    Dim. Utilisées = taille dans le mur • 
                    Chutes = morceaux restants après découpe
                </div>
                ${cutsTableHtml}
            </div>

            ${wasteByFamilyHtml}

            <!-- Boutons (inchangés) -->
            <div style="text-align: center; margin-top: 20px;">
                <button onclick="exportCuttingDetailsToCSV()" style="margin-right: 10px; padding: 10px 20px; background: #27ae60; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    📥 Exporter Découpes CSV
                </button>
                <button onclick="closeCuttingDetails()" style="padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Fermer
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Fonctions des boutons (inchangées)
    window.closeCuttingDetails = function() {
        document.body.removeChild(modal);
    };
    
    window.exportCuttingDetailsToCSV = function() {
        exportDetailedCuttingDetailsToCSV(details);
    };
}

// 3. FONCTION POUR EXPORTER LES DÉCOUPES EN CSV
function exportDetailedCuttingDetailsToCSV(details) {
    if (details.detailedCuts.length === 0) {
        alert('Aucune découpe à exporter !');
        return;
    }

    // Préparer les données CSV avec plus de détails
    const csvData = details.detailedCuts.map(cut => ({
        'Casier': cut.ref,
        'Famille': cut.family,
        'Qualité': cut.quality,
        'Rangée': cut.row,
        'Position': cut.position,
        
        // Dimensions originales
        'Original_L_mm': cut.originalLength,
        'Original_l_mm': cut.originalWidth,
        'Original_É_mm': cut.originalThickness,
        'Volume_Original_mm3': cut.originalLength * cut.originalWidth * cut.originalThickness,
        
        // Dimensions utilisées
        'Utilisé_L_mm': cut.usedLength,
        'Utilisé_l_mm': cut.usedWidth,
        'Utilisé_É_mm': cut.usedThickness,
        'Volume_Utilisé_mm3': cut.usedLength * cut.usedWidth * cut.usedThickness,
        
        // Découpes
        'Type_Découpe': cut.cutType,
        'Découpe_Longueur': cut.needsCutLength ? 'Oui' : 'Non',
        'Découpe_Largeur': cut.needsCutWidth ? 'Oui' : 'Non',
        'Chute_L_mm': cut.wasteLength,
        'Chute_l_mm': cut.wasteWidth,
        
        // Chutes détaillées
        'Chutes_Détail': cut.wasteDetails.map(w => `${w.type}: ${w.dimensions}`).join(' | '),
        'Volume_Chutes_mm3': Math.round(cut.wasteVolume),
        'Efficacité_%': cut.efficiency.toFixed(1),
        
        // Autres
        'Violations_Jointures': cut.violatesJoints ? 'Oui' : 'Non'
    }));

    // Convertir en CSV
    const headers = Object.keys(csvData[0]);
    const csvRows = [headers.join(',')];
    
    csvData.forEach(row => {
        const values = headers.map(header => {
            const value = row[header];
            return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
        });
        csvRows.push(values.join(','));
    });

    const csv = csvRows.join('\n');

    // Télécharger le fichier
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `detailDecoupesAmeliore_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    alert('✅ Détail amélioré des découpes exporté en CSV !');
}

console.log('✅ Tableau des découpes amélioré avec détails complets');

