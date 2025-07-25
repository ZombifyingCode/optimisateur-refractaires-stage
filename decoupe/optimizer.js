// OPTIMISATEUR DE DÉCOUPE - BE FOURS
// Code organisé en modules logiques

// ====================================================================
// 1. CONFIGURATION ET CONSTANTES
// ====================================================================

// Variables globales
let stockData = [];
let allStockData = [];
let optimizationResult = null;
let selectedCandidateIndex = 0;

// Variables pour rotation continue et mesures interactives
let autoRotationInterval = null;
let currentRotationAngle = 0;
let currentTargetDimensions = null;
let currentCandidateBlock = null;

// Couleurs par famille de matériaux réfractaires
const familyColors = {
    'ELECTROFONDUS': 'family-electrofondus',
    'SILICE': 'family-silice',
    'ZIRCON DENSE': 'family-zircon-dense',
    'ZIRCON MULLITE': 'family-zircon-mullite',
    'SILLIMANITE': 'family-sillimanite',
    'ISOLANTS': 'family-isolants',
    'DIVERS': 'family-divers',
    '40% AL2O3': 'family-40-al2o3'
};

// ====================================================================
// 2. MODULE GESTION DES FICHIERS EXCEL
// ====================================================================

/**
 * Gestion de l'importation d'un fichier Excel
 */
async function handleExcelFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const statusDiv = document.getElementById('importStatus');
    statusDiv.style.display = 'block';
    statusDiv.className = 'alert alert-info';
    statusDiv.innerHTML = `📥 Lecture du fichier "${file.name}" en cours...`;

    try {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, {
            type: 'array',
            cellText: false,
            cellDates: true,
            cellStyles: false
        });

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        if (!worksheet) {
            throw new Error('Aucune feuille de calcul trouvée dans le fichier');
        }

        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: '',
            blankrows: false
        });

        if (jsonData.length === 0) {
            throw new Error('Le fichier Excel semble vide');
        }

        const parsedStock = parseInventaireBEFours(jsonData);

        if (parsedStock.length === 0) {
            throw new Error('Aucune donnée valide trouvée');
        }

        allStockData = parsedStock;
        stockData = parsedStock;

        FilterManager.setupFamilyFilter();
        UIManager.updateStockTable();

        statusDiv.className = 'alert alert-info';
        statusDiv.innerHTML = `✅ Import réussi ! ${parsedStock.length} casiers chargés avec ${DataUtils.getUniqueFamilies().length} familles`;

    } catch (error) {
        console.error('❌ Erreur import Excel:', error);
        statusDiv.className = 'alert alert-warning';
        statusDiv.innerHTML = `❌ Erreur lors de l'import: ${error.message}`;
    }
}

/**
 * Analyse et extraction des données du fichier Excel format BE Fours
 */
function parseInventaireBEFours(jsonData) {
    if (jsonData.length < 5) {
        throw new Error('Fichier trop court - format Inventaire BE Fours attendu');
    }

    // Les en-têtes sont à la ligne 3 (index 2)
    const headerRowIndex = 2;
    const headers = jsonData[headerRowIndex];

    if (!headers || headers.length < 11) {
        throw new Error('En-têtes non trouvés à la ligne 3');
    }

    // Mapping des colonnes selon le format exact avec QUALITÉ
    const columnIndices = {
        famille: 1,     // Colonne B: FAMILLE
        casier: 3,      // Colonne D: CASIER  
        longueur: 6,    // Colonne G: LONGUEUR
        largeur: 7,     // Colonne H: LARGEUR
        epaisseur: 8,   // Colonne I: EPAISSEUR
        qualite: 10,    // Colonne K: QUALITÉ
        supplier: 11,
        stock: 12       // Colonne L: STOCK
    };

    const parsedData = [];
    
    // Commencer à la ligne 4 (index 3) - après les en-têtes
    for (let i = 3; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || row.length === 0) continue;

        try {
            const famille = String(row[columnIndices.famille] || '').trim().toUpperCase();
            const casier = String(row[columnIndices.casier] || '').trim();
            const qualite = String(row[columnIndices.qualite] || 'Non défini').trim();
            const supplier = String(row[columnIndices.supplier] || '').trim();
            
            // Parsing des dimensions numériques
            const longueur = parseFloat(String(row[columnIndices.longueur] || '0').replace(',', '.')) || 0;
            const largeur = parseFloat(String(row[columnIndices.largeur] || '0').replace(',', '.')) || 0;
            const epaisseur = parseFloat(String(row[columnIndices.epaisseur] || '0').replace(',', '.')) || 0;
            
            // Parsing du stock (format "10 PC" -> 10)
            let stock = 0;
            const stockStr = String(row[columnIndices.stock] || '0');
            const stockMatch = stockStr.match(/(\d+(?:[\.,]\d+)?)/);
            if (stockMatch) {
                stock = parseInt(stockMatch[1].replace(',', '.'));
            }

            // Filtrer les lignes valides
            if (!famille || !casier || longueur <= 0 || largeur <= 0 || epaisseur <= 0) {
                continue;
            }

            parsedData.push({
                ref: casier,
                length: longueur,
                width: largeur,
                thickness: epaisseur,
                quantity: stock,
                family: famille,
                quality: qualite,
                supplier: supplier 
            });

        } catch (error) {
            console.log(`⚠️ Erreur ligne ${i + 1}:`, error.message);
        }
    }

    return parsedData;
}

/**
 * Chargement des données d'exemple pour démonstration
 */
function loadSampleStock() {
    allStockData = [
        // Famille ELECTROFONDUS avec différentes qualités électrofondus
        {supplier: "SEFPR", ref: "PFI_023DA_000", length: 1500, width: 300, thickness: 412, quantity: 10, family: "ELECTROFONDUS", quality: "AZS 33% RC"},
        {supplier: "SEFPR", ref: "PFI_04X5A_000", length: 890, width: 400, thickness: 250, quantity: 1, family: "ELECTROFONDUS", quality: "AZS 33% VF"},
        {supplier: "SEFPR", ref: "PFI_05B2A_000", length: 1200, width: 350, thickness: 380, quantity: 3, family: "ELECTROFONDUS", quality: "AZS 41% VF"},
        {supplier: "SEFPR", ref: "PFI_06C3A_000", length: 800, width: 300, thickness: 250, quantity: 5, family: "ELECTROFONDUS", quality: "95% ZrO2"},
        {supplier: "SEFPR", ref: "PFI_07D4A_000", length: 950, width: 280, thickness: 320, quantity: 2, family: "ELECTROFONDUS", quality: "ER 1682 RX"},
        {supplier: "SEFPR", ref: "PFI_08E5A_000", length: 750, width: 250, thickness: 200, quantity: 4, family: "ELECTROFONDUS", quality: "ER 5312 RX"},
        {supplier: "SEFPR", ref: "PFI_09F6A_000", length: 600, width: 300, thickness: 150, quantity: 1, family: "ELECTROFONDUS", quality: "Jargal"},
        
        // Famille ZIRCON DENSE/MULLITE avec qualités zircon
        {supplier: "SEFPR", ref: "ZDN_700C_000", length: 1400, width: 700, thickness: 400, quantity: 3, family: "ZIRCON DENSE", quality: "ZM30%"},
        {supplier: "SEFPR", ref: "ZMT_550D_001", length: 1100, width: 550, thickness: 320, quantity: 4, family: "ZIRCON MULLITE", quality: "ZM20%"},
        
        // Famille SILLIMANITE avec qualités silico-alumineux
        {supplier: "SEFPR", ref: "SLM_400E_000", length: 950, width: 480, thickness: 310, quantity: 6, family: "SILLIMANITE", quality: ">99% Al2O3"},
        {supplier: "SEFPR", ref: "SLM_401E_000", length: 850, width: 420, thickness: 280, quantity: 8, family: "SILLIMANITE", quality: "60% Al2O3"},
        {supplier: "SEFPR", ref: "SLM_402E_000", length: 750, width: 380, thickness: 250, quantity: 5, family: "SILLIMANITE", quality: "40/42% Al2O3"},
        {supplier: "SEFPR", ref: "SLM_403E_000", length: 650, width: 340, thickness: 220, quantity: 7, family: "SILLIMANITE", quality: "35% Al2O3"},
        
        // Famille DIVERS avec qualités magnésie
        {supplier: "SEFPR", ref: "DIV_600G_000", length: 1300, width: 650, thickness: 380, quantity: 2, family: "DIVERS", quality: "MgO > 95%"},
        {supplier: "SEFPR", ref: "DIV_601G_000", length: 1100, width: 550, thickness: 320, quantity: 3, family: "DIVERS", quality: "MgO 85-90%"},
        {supplier: "SEFPR", ref: "DIV_602G_000", length: 900, width: 450, thickness: 280, quantity: 4, family: "DIVERS", quality: "MgO 70-75%"},
        {supplier: "SEFPR", ref: "DIV_603G_000", length: 700, width: 350, thickness: 240, quantity: 6, family: "DIVERS", quality: "MgO 50-60%"},
        
        // Famille SILICE avec qualités silice
        {supplier: "SEFPR", ref: "SIL_450B_001", length: 1200, width: 600, thickness: 350, quantity: 5, family: "SILICE", quality: "SiO2 99%"},
        {supplier: "SEFPR", ref: "SIL_300A_002", length: 1000, width: 500, thickness: 300, quantity: 8, family: "SILICE", quality: "SiO2 95%"},
        
        // Famille ISOLANTS avec quelques qualités mixtes
        {supplier: "SEFPR", ref: "ISO_250F_001", length: 800, width: 400, thickness: 250, quantity: 12, family: "ISOLANTS", quality: "Non défini"},
        {supplier: "SEFPR", ref: "AL2_350H_001", length: 900, width: 450, thickness: 280, quantity: 7, family: "40% AL2O3", quality: "Non défini"},
    ];
    
    stockData = allStockData;
    FilterManager.setupFamilyFilter();
    UIManager.updateStockTable();

    const statusDiv = document.getElementById('importStatus');
    statusDiv.style.display = 'block';
    statusDiv.className = 'alert alert-info';
    statusDiv.innerHTML = '✅ Exemple enrichi chargé ! 21 types de réfractaires avec 8 familles et 18 qualités spécialisées.';
}

// ====================================================================
// 3. MODULE UTILITAIRES DE DONNÉES
// ====================================================================

const DataUtils = {
    /**
     * Récupère les familles uniques des données
     */
    getUniqueFamilies() {
        const families = [...new Set(allStockData.map(item => item.family))];
        return families.sort();
    },

    /**
     * Récupère les qualités uniques des données
     */
    getUniqueQualities() {
        const qualities = [...new Set(allStockData.map(item => item.quality))];
        return qualities.sort();
    },

    /**
     * Récupère les fournisseurs uniques des données
     */
    getUniqueSuppliers() {
        const suppliers = [...new Set(allStockData.map(item => item.supplier))];
        return suppliers.sort();
    },

    /**
     * Génère toutes les permutations possibles des dimensions d'un bloc
     */
    generatePermutations(block) {
        const { length, width, thickness } = block;
        return [
            { length, width, thickness }, // Original
            { length, width: thickness, thickness: width }, // Permutation 1
            { length: width, width: length, thickness }, // Permutation 2
            { length: width, width: thickness, thickness: length }, // Permutation 3
            { length: thickness, width: length, thickness: width }, // Permutation 4
            { length: thickness, width, thickness: length } // Permutation 5
        ];
    }
};

// ====================================================================
// 4. MODULE GESTION DES FILTRES
// ====================================================================

const FilterManager = {
    /**
     * Configuration des filtres de familles et qualités
     */
    setupFamilyFilter() {
        const families = DataUtils.getUniqueFamilies();
        const qualities = DataUtils.getUniqueQualities();
        const familyFilter = document.getElementById('familyFilter');
        const qualityFilter = document.getElementById('qualityFilter');
        const familySection = document.getElementById('familyFilterSection');

        familyFilter.innerHTML = '<option value="all">🌐 Toutes les familles</option>';
        qualityFilter.innerHTML = '<option value="all">🌟 Toutes les qualités</option>';

        // Remplissage du filtre familles
        families.forEach(family => {
            const option = document.createElement('option');
            option.value = family;
            
            const familyIcons = {
                'ELECTROFONDUS': '⚡',
                'SILICE': '🧊',
                'ZIRCON DENSE': '💎',
                'ZIRCON MULLITE': '🔷',
                'SILLIMANITE': '🗿',
                'ISOLANTS': '🛡️',
                'DIVERS': '📦',
                '40% AL2O3': '🧱'
            };
            
            const icon = familyIcons[family] || '📋';
            option.textContent = `${icon} ${family}`;
            familyFilter.appendChild(option);
        });

        // Remplissage du filtre qualités
        qualities.forEach(quality => {
            const option = document.createElement('option');
            option.value = quality;
            
            const qualityIcons = {
                'AZS 33% RC': '💎',
                'AZS 33% VF': '💠',
                'AZS 41% VF': '🔷',
                'Non défini': '❓',
                'Jargal': '🔶',
                '95% ZrO2': '💍',
                'ER 1682 RX': '🔹',
                'ER 5312 RX': '🟦',
                'ZM30%': '🔵',
                'ZM20%': '🟣',
                '>99% Al2O3': '⚪',
                '60% Al2O3': '🔘',
                '40/42% Al2O3': '⚫',
                '35% Al2O3': '🟤',
                'MgO > 95%': '🟢',
                'MgO 85-90%': '🟩',
                'MgO 70-75%': '💚',
                'MgO 50-60%': '🌿',
                'SiO2 99%': '❄️',
                'SiO2 95%': '🧊'
            };
            
            const icon = qualityIcons[quality] || '⭐';
            option.textContent = `${icon} ${quality}`;
            qualityFilter.appendChild(option);
        });

        familySection.style.display = 'block';
        this.updateFamilyStats();
    },

    /**
     * Application des filtres famille et qualité
     */
    filterByFamilyAndQuality() {
        const selectedFamily = document.getElementById('familyFilter').value;
        const selectedQuality = document.getElementById('qualityFilter').value;
        
        stockData = allStockData.filter(item => {
            const familyMatch = selectedFamily === 'all' || item.family === selectedFamily;
            const qualityMatch = selectedQuality === 'all' || item.quality === selectedQuality;
            return familyMatch && qualityMatch;
        });
        
        UIManager.updateStockTable();
        this.updateFamilyStats();
    },

    /**
     * Mise à jour des statistiques affichées
     */
    updateFamilyStats() {
        const availableBlocks = stockData.filter(item => item.quantity > 0).length;
        const totalStock = stockData.reduce((sum, item) => sum + item.quantity, 0);
        const uniqueQualities = [...new Set(stockData.map(item => item.quality))];
        const qualityCount = uniqueQualities.length;
        
        document.getElementById('availableBlocks').textContent = availableBlocks;
        document.getElementById('totalStock').textContent = totalStock;
        document.getElementById('qualityCount').textContent = qualityCount;
    }
};

// ====================================================================
// 5. MODULE INTERFACE UTILISATEUR
// ====================================================================

const UIManager = {
    /**
     * Mise à jour du tableau d'affichage des pièces
     */
    updateStockTable() {
        const tbody = document.getElementById('stockTableBody');
        tbody.innerHTML = '';

        if (stockData.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="8" style="text-align: center; color: #7f8c8d; padding: 30px;">
                    📁 Aucune donnée à afficher
                </td>
            `;
            tbody.appendChild(row);
            return;
        }

        stockData.forEach(block => {
            const row = document.createElement('tr');
            const familyClass = familyColors[block.family] || 'family-divers';
            
            const qualityClass = block.quality === 'Non défini' ? 
                'style="color: #e74c3c; font-style: italic;"' : 
                'style="color: #27ae60; font-weight: 600;"';
            
            row.innerHTML = `
                <td><span class="family-cell ${familyClass}">${block.family}</span></td>
                <td ${qualityClass}>${block.quality}</td>
                <td>${block.supplier}</td>
                <td style="font-weight: 600; color: #e17055; font-size: 0.8rem;">${block.ref}</td>
                <td>${block.length}</td>
                <td>${block.width}</td>
                <td>${block.thickness}</td>
                <td style="font-weight: 600; color: #00b894;">${block.quantity}</td>
            `;
            tbody.appendChild(row);
        });

        // Ligne de résumé
        const summaryRow = document.createElement('tr');
        summaryRow.style.background = '#f8f9fa';
        summaryRow.style.fontWeight = '600';
        const totalStock = stockData.reduce((sum, item) => sum + item.quantity, 0);
        summaryRow.innerHTML = `
            <td colspan="7" style="text-align: right; color: #2c3e50;">TOTAL :</td>
            <td style="color: #e74c3c;">${totalStock} pcs</td>
        `;
        tbody.appendChild(summaryRow);
    },

    /**
     * Mise à jour de l'affichage des dimensions cibles
     */
    updateTargetDisplay(length, width, thickness) {
        const volume = (length * width * thickness) / 1000000000;
        document.getElementById('targetDisplay').innerHTML = `
            <div class="target-dimensions">${length} × ${width} × ${thickness} mm</div>
            <div class="target-volume">Volume cible : ${volume.toLocaleString()} m³</div>
        `;
    },

    /**
     * Affichage de la liste des candidats
     */
    displayCandidatesList(candidates, criteria) {
        const container = document.getElementById('candidatesList');
        if (!container) return;

        container.innerHTML = '';

        const headerDiv = document.createElement('div');
        headerDiv.style.cssText = 'background: #e8f4f8; padding: 10px; border-radius: 6px; margin-bottom: 15px; text-align: center; border: 1px solid #74b9ff;';
        headerDiv.innerHTML = '<small style="color: #0984e3; font-weight: 600;">💡 Cliquez sur un candidat pour voir ses détails de découpe</small>';
        container.appendChild(headerDiv);

        candidates.slice(0, 8).forEach((candidate, index) => {
            const item = document.createElement('div');
            item.className = 'candidate-item';
            
            if (index === selectedCandidateIndex) {
                item.classList.add('selected');
            }

            if (index === 0) {
                item.classList.add('best');
            }

            let scoreClass = 'score-good';
            let scoreText = 'CORRECT';

            if (index === 0) {
                scoreClass = 'score-best';
                scoreText = 'OPTIMAL';
            }

            const analysis = candidate.analysis;
            const block = candidate.block;

            let criteriaInfo = `Découpes: ${analysis.cuts}`;
            
            if (criteria === 'minWaste') {
                criteriaInfo += ` | Chutes: ${analysis.wasteVolume.toLocaleString()} m³ `;
            } else if (criteria === 'minCuts') {
                criteriaInfo += ` | Chutes: ${analysis.wasteVolume.toLocaleString()} m³`;
            }

            const piecesInfo = analysis.totalPieces > 1 ? 
                `<strong style="color: #00b894;">🎯 ${analysis.totalPieces} pièces</strong> (${analysis.arrangement})<br>` : 
                `<strong>🎯 1 pièce</strong><br>`;

            const familyClass = familyColors[block.family] || 'family-divers';

            item.innerHTML = `
                <div class="candidate-header">
                    <span class="candidate-ref">#${index + 1} - ${block.ref}</span>
                    <span class="candidate-score ${scoreClass}">${scoreText}</span>
                </div>
                <div class="candidate-details">
                    <span class="family-cell ${familyClass}" style="display: inline-block; margin-bottom: 5px;">${block.family} - ${block.quality} - ${block.supplier}</span><br>
                    <strong>Dim:</strong> ${block.length}×${block.width}×${block.thickness}mm | <strong>Stock:</strong> ${block.quantity}<br>
                    ${piecesInfo}
                    <strong style="color: #e17055;">${criteriaInfo}</strong><br>
                    <strong>Efficacité:</strong> ${analysis.efficiency.toFixed(1)}%
                </div>
            `;

            item.addEventListener('click', () => {
                CandidateManager.selectCandidate(index);
            });

            if (index === selectedCandidateIndex) {
                const selectedIndicator = document.createElement('div');
                selectedIndicator.style.cssText = 'position: absolute; top: 5px; right: 5px; background: #e17055; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600;';
                selectedIndicator.textContent = '✓';
                item.style.position = 'relative';
                item.appendChild(selectedIndicator);
            }

            container.appendChild(item);
        });

        if (candidates.length > 8) {
            const moreInfo = document.createElement('div');
            moreInfo.style.cssText = 'text-align: center; padding: 10px; color: #7f8c8d; font-style: italic;';
            moreInfo.textContent = `... et ${candidates.length - 8} autre(s) candidat(s)`;
            container.appendChild(moreInfo);
        }

        const noteDiv = document.createElement('div');
        noteDiv.style.cssText = 'background: #fff3cd; padding: 8px; border-radius: 6px; margin-top: 10px; text-align: center; border: 1px solid #ffc107;';
        noteDiv.innerHTML = '<small style="color: #856404;">ℹ️ Le candidat sélectionné apparaît dans "Bloc choisi" et "Découpes à réaliser"</small>';
        container.appendChild(noteDiv);
    }
};

// ====================================================================
// 6. MODULE ALGORITHME D'OPTIMISATION
// ====================================================================

const OptimizationEngine = {
    /**
     * Recherche du meilleur bloc pour la découpe
     */
    findBestBlock() {
        const targetLength = parseInt(document.getElementById('targetLength').value);
        const targetWidth = parseInt(document.getElementById('targetWidth').value);
        const targetThickness = parseInt(document.getElementById('targetThickness').value);
        const criteria = document.getElementById('optimizationCriteria').value;

        if (stockData.length === 0) {
            alert('Veuillez d\'abord charger un inventaire !');
            return;
        }

        if (targetLength <= 0 || targetWidth <= 0 || targetThickness <= 0) {
            alert('Veuillez saisir des dimensions valides !');
            return;
        }

        document.getElementById('resultsSection').style.display = 'block';
        document.getElementById('optimizationStatus').textContent = 'Analyse des candidats en cours...';

        UIManager.updateTargetDisplay(targetLength, targetWidth, targetThickness);

        setTimeout(() => {
            const result = this.analyzeBlocks(targetLength, targetWidth, targetThickness, criteria);
            this.displayResults(result, targetLength, targetWidth, targetThickness);
        }, 500);
    },

    /**
     * Analyse de tous les blocs pour trouver les candidats appropriés
     */
    analyzeBlocks(targetL, targetW, targetT, criteria) {
        console.log(`🎯 RECHERCHE: ${targetL}×${targetW}×${targetT}mm`);
        console.log(`📦 Stock disponible: ${stockData.length} types`);

        const targetVolume = (targetL * targetW * targetT) / 1000000000;
        const candidates = [];

        stockData.forEach(block => {
            if (block.quantity <= 0) return;

            // Générer les permutations des dimensions du bloc
            const permutations = DataUtils.generatePermutations(block);

            // Vérifier chaque permutation
            permutations.forEach(perm => {
                if (perm.length >= targetL && perm.width >= targetW && perm.thickness >= targetT) {
                    const analysis = this.analyzeBlock(perm, targetL, targetW, targetT);
                    candidates.push({
                        block: block,
                        analysis: analysis,
                        score: this.calculateScore(analysis, criteria),
                        permutedDimensions: perm
                    });
                }
            });
        });

        candidates.sort((a, b) => a.score - b.score);

        console.log(`✅ ${candidates.length} candidats trouvés`);

        return {
            candidates: candidates,
            targetVolume: targetVolume,
            criteria: criteria
        };
    },

    /**
     * Analyse détaillée d'un bloc spécifique
     */
    analyzeBlock(dimensions, targetL, targetW, targetT) {
        const {length, width, thickness} = dimensions;
        
        // Calcul du nombre de pièces dans chaque dimension
        const piecesL = Math.floor(length / targetL);
        const piecesW = Math.floor(width / targetW);
        const piecesT = Math.floor(thickness / targetT);
        const totalPieces = piecesL * piecesW * piecesT;
        
        // Calcul des volumes
        const usedVolume = ((targetL * targetW * targetT)) / 1000000000;
        const blockVolume = (length * width * thickness) / 1000000000;
        const wasteVolume = blockVolume - usedVolume;
        
        // Calcul nombre de découpes
        let cuts = 0;
        if (length > targetL) cuts++; 
        if (width > targetW) cuts++; 
        if (thickness > targetT) cuts++; 
        
        // Calcul des chutes dans chaque dimension
        const lengthWaste = length - targetL;
        const widthWaste = width - targetW;
        const thicknessWaste = thickness - targetT;

        return {
            cuts: cuts,
            wasteVolume: wasteVolume,
            wastePercent: (wasteVolume / blockVolume) * 100,
            lengthWaste: lengthWaste,
            widthWaste: widthWaste,
            thicknessWaste: thicknessWaste,
            efficiency: (usedVolume / blockVolume) * 100,
            totalPieces: totalPieces,
            piecesL: piecesL,
            piecesW: piecesW,
            piecesT: piecesT,
            usedVolume: usedVolume,
            arrangement: `${piecesL}×${piecesW}×${piecesT}`,
            wastePerPiece: totalPieces > 0 ? wasteVolume / totalPieces : wasteVolume,
            needsCutL: length > targetL,
            needsCutW: width > targetW,
            needsCutT: thickness > targetT
        };
    },

    /**
     * Calcul du score d'un bloc selon les critères
     */
    calculateScore(analysis, criteria) {
        switch (criteria) {
            case 'minWaste':
                return analysis.wasteVolume;
            case 'minCuts':
                return analysis.cuts * 1000000 + analysis.wastePerPiece;
            default:
                return analysis.wastePerPiece;
        }
    },

    /**
     * Affichage des résultats de l'optimisation
     */
    displayResults(result, targetL, targetW, targetT) {
        if (!result || !result.candidates || result.candidates.length === 0) {
            document.getElementById('optimizationStatus').textContent = 'Aucun bloc compatible trouvé dans l\'inventaire !';
            document.getElementById('optimizationStatus').className = 'alert alert-warning';
            document.getElementById('exportPDFBtn').style.display = 'none';

            VisualizationManager.clearVisualization('combinedBlockViz');
            VisualizationManager.clearVisualization('cuttingDetails');
            document.getElementById('candidatesList').innerHTML = '<div style="text-align: center; color: #7f8c8d; padding: 30px;">Aucun candidat disponible</div>';
            return;
        }

        selectedCandidateIndex = 0;
        const bestCandidate = result.candidates[0];
        
        document.getElementById('optimizationStatus').innerHTML = `
            ✅ ${result.candidates.length} candidat(s) trouvé(s) ! 
            Meilleur choix : <strong>${bestCandidate.block.ref}</strong> (${bestCandidate.block.family})
        `;
        document.getElementById('optimizationStatus').className = 'alert alert-info';

        document.getElementById('exportPDFBtn').style.display = 'inline-block';

        VisualizationManager.visualizeCombinedBlocks({length: targetL, width: targetW, thickness: targetT}, null);
        
        CandidateManager.updateSelectedCandidate(targetL, targetW, targetT);
        UIManager.displayCandidatesList(result.candidates, result.criteria);

        optimizationResult = result;
    }
};

// ====================================================================
// 7. MODULE GESTION DES CANDIDATS
// ====================================================================

const CandidateManager = {
    /**
     * Mise à jour du candidat sélectionné
     */
    updateSelectedCandidate(targetL, targetW, targetT) {
        if (!optimizationResult || !optimizationResult.candidates || optimizationResult.candidates.length === 0) {
            return;
        }

        const selectedCandidate = optimizationResult.candidates[selectedCandidateIndex];
        
        VisualizationManager.visualizeCombinedBlocks(
            {length: targetL, width: targetW, thickness: targetT}, 
            selectedCandidate.block
        );

        this.displayCuttingDetailsSimplified(selectedCandidate.block, targetL, targetW, targetT, selectedCandidate.analysis);

        const statusDiv = document.getElementById('optimizationStatus');
        if (selectedCandidateIndex === 0) {
            statusDiv.innerHTML = `
                ✅ ${optimizationResult.candidates.length} candidat(s) trouvé(s) ! 
                Meilleur choix : <strong>${selectedCandidate.block.ref}</strong> (${selectedCandidate.block.family})
            `;
        } else {
            statusDiv.innerHTML = `
                ✅ ${optimizationResult.candidates.length} candidat(s) trouvé(s) ! 
                Candidat sélectionné : <strong>${selectedCandidate.block.ref}</strong> (${selectedCandidate.block.family}) - Rang #${selectedCandidateIndex + 1}
            `;
        }
    },

    /**
     * Sélection d'un candidat spécifique
     */
    selectCandidate(index) {
        if (!optimizationResult || !optimizationResult.candidates || index >= optimizationResult.candidates.length) {
            return;
        }

        selectedCandidateIndex = index;
        
        const targetL = parseInt(document.getElementById('targetLength').value);
        const targetW = parseInt(document.getElementById('targetWidth').value);
        const targetT = parseInt(document.getElementById('targetThickness').value);
        
        this.updateSelectedCandidate(targetL, targetW, targetT);
        this.updateCandidateSelection();
    },

    /**
     * Mise à jour de la sélection visuelle des candidats
     */
    updateCandidateSelection() {
        const candidateItems = document.querySelectorAll('.candidate-item');
        candidateItems.forEach((item, index) => {
            item.classList.remove('selected');
            if (index === selectedCandidateIndex) {
                item.classList.add('selected');
            }
        });
    },

    /**
     * Affichage des détails de découpe pour un bloc
     */
    displayCuttingDetailsSimplified(originalBlock, targetL, targetW, targetT, analysis) {
        const container = document.getElementById('cuttingDetails');
        if (!container) return;

        container.innerHTML = '';

        const cuttingPlan = [];
        
        if (analysis.needsCutL) {
            cuttingPlan.push({
                dimension: 'Longueur',
                pieces: analysis.piecesL,
                pieceSize: targetL,
                blockSize: originalBlock.length,
                waste: analysis.lengthWaste,
                cuts: 1
            });
        }
        
        if (analysis.needsCutW) {
            cuttingPlan.push({
                dimension: 'Largeur', 
                pieces: analysis.piecesW,
                pieceSize: targetW,
                blockSize: originalBlock.width,
                waste: analysis.widthWaste,
                cuts: 1
            });
        }
        
        if (analysis.needsCutT) {
            cuttingPlan.push({
                dimension: 'Épaisseur',
                pieces: analysis.piecesT,
                pieceSize: targetT,
                blockSize: originalBlock.thickness,
                waste: analysis.thicknessWaste,
                cuts: 1
            });
        }

        if (cuttingPlan.length === 0) {
            container.innerHTML += `
                <div style="text-align: center; color: #00b894; padding: 30px;">
                    <strong>✅ Aucune découpe nécessaire</strong><br>
                    <small>Les dimensions correspondent exactement</small>
                </div>
            `;
            return;
        }

        const sequenceDiv = document.createElement('div');
        sequenceDiv.innerHTML = '<h4 style="color: #2c3e50; margin-bottom: 15px;">📋 Séquence de découpe</h4>';
        
        cuttingPlan.forEach((plan, index) => {
            const stepDiv = document.createElement('div');
            stepDiv.className = 'sequence-step';
            
            const stepTitle = `Étape ${index + 1}: ${plan.dimension}`;
            
            stepDiv.innerHTML = `
                <div class="step-header">
                    <span class="step-title">${stepTitle}</span>
                </div>
                <div style="font-size: 0.9rem; color: #2c3e50; margin-bottom: 6px;">
                    📏 ${plan.blockSize}mm →  ${plan.pieceSize}mm
                </div>
                <div style="font-size: 0.85rem; color: #636e72;">
                    ✂️ ${plan.cuts} découpe(s) | 📐 Chute: ${plan.waste}mm
                </div>
            `;
            
            sequenceDiv.appendChild(stepDiv);
        });
        
        container.appendChild(sequenceDiv);

        const finalDiv = document.createElement('div');
        finalDiv.style.cssText = 'background: #d1f2eb; padding: 15px; border-radius: 8px; margin-top: 15px; text-align: center; border: 2px solid #00b894;';
        finalDiv.innerHTML = `
            <strong>🎯 Production finale</strong><br>
            <div style="font-family: 'Courier New', monospace; font-weight: 600; margin: 8px 0; font-size: 1.1rem;">
                ${analysis.totalPieces} × (${targetL} × ${targetW} × ${targetT} mm)
            </div>
            <div style="font-family: 'Courier New', monospace; font-weight: 600; margin: 8px 0; font-size: 1.1rem;"> 
                Découpes: ${analysis.cuts} | Chutes: ${analysis.wasteVolume.toLocaleString()} m³
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px; font-size: 0.9rem;">
                <div>Volume utile: ${analysis.usedVolume.toLocaleString()} m³</div>
                <div>Efficacité: ${analysis.efficiency.toFixed(1)}%</div>
            </div>
        `;
        container.appendChild(finalDiv);
    }
};

// ====================================================================
// 8. MODULE VISUALISATION 3D
// ====================================================================

const VisualizationManager = {
    /**
     * Effacement de la visualisation
     */
    clearVisualization(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '<div style="text-align: center; color: #7f8c8d; padding: 30px;">Aucun bloc à afficher</div>';
        
        document.getElementById('rotationControls').style.display = 'none';
        document.getElementById('vizLegend').style.display = 'none';
    },

    /**
 * Visualisation combinée des blocs cible et candidat
 */
visualizeCombinedBlocks(targetDimensions, candidateBlock) {
    const container = document.getElementById('combinedBlockViz');
    if (!container) return;

    currentTargetDimensions = targetDimensions;
    currentCandidateBlock = candidateBlock;
    container.innerHTML = '';

    let maxDim = Math.max(targetDimensions.length, targetDimensions.width, targetDimensions.thickness);

    if (candidateBlock) {
        maxDim = Math.max(maxDim, candidateBlock.length, candidateBlock.width, candidateBlock.thickness);
    }

    const scale = Math.min(200 / maxDim, 1.5);

    const sceneDiv = document.createElement('div');
    sceneDiv.className = 'combined-scene';

    const containerDiv = document.createElement('div');
    containerDiv.className = 'combined-box-container';
    containerDiv.id = 'combinedBoxContainer';

    // Créer le bloc cible
    const targetBox = this.createBlock3D(targetDimensions, scale, 'target', 'Cible');

    const baseOffsetX = -80;
    const baseOffsetY = 20;

    const targetOffsetX = baseOffsetX + (targetDimensions.length * scale) / 2;
    const targetOffsetY = baseOffsetY - (targetDimensions.thickness * scale) / 2;
    const targetOffsetZ = (targetDimensions.width * scale) / 2;

    targetBox.style.transform = `translate(calc(-50% + ${targetOffsetX}px), calc(-50% + ${targetOffsetY}px)) translateZ(${targetOffsetZ}px)`;
    containerDiv.appendChild(targetBox);

    // Créer le bloc candidat avec permutations
    if (candidateBlock) {
        // Permuter les dimensions du bloc candidat pour correspondre à l'orientation souhaitée
        const permutedCandidateBlock = this.orientCandidateBlock(candidateBlock, targetDimensions);

        const candidateBox = this.createBlock3D(permutedCandidateBlock, scale, 'candidate', candidateBlock.ref);

        const candidateOffsetX = baseOffsetX + (permutedCandidateBlock.length * scale) / 2;
        const candidateOffsetY = baseOffsetY - (permutedCandidateBlock.thickness * scale) / 2;
        const candidateOffsetZ = (permutedCandidateBlock.width * scale) / 2;

        candidateBox.style.transform = `translate(calc(-50% + ${candidateOffsetX}px), calc(-50% + ${candidateOffsetY}px)) translateZ(${candidateOffsetZ}px)`;
        containerDiv.appendChild(candidateBox);
    }

    sceneDiv.appendChild(containerDiv);
    container.appendChild(sceneDiv);

    // Tooltip pour les dimensions
    const tooltip = document.createElement('div');
    tooltip.className = 'dimension-tooltip';
    tooltip.id = 'dimensionTooltip';
    document.body.appendChild(tooltip);

    // Informations sur les dimensions
    const infoDiv = document.createElement('div');
    infoDiv.className = 'dimensions-info';

    const targetInfo = document.createElement('div');
    targetInfo.className = 'dimension-item target';
    targetInfo.innerHTML = `
        <strong>Cible</strong><br>
        ${targetDimensions.length} × ${targetDimensions.width} × ${targetDimensions.thickness} mm<br>
        <small>${((targetDimensions.length * targetDimensions.width * targetDimensions.thickness)/1e9).toLocaleString()} m³</small>
    `;
    infoDiv.appendChild(targetInfo);

    if (candidateBlock) {
        const permutedCandidateBlock = this.orientCandidateBlock(candidateBlock, targetDimensions);
        const candidateInfo = document.createElement('div');
        candidateInfo.className = 'dimension-item candidate';
        candidateInfo.innerHTML = `
            <strong>Candidat</strong><br>
            ${permutedCandidateBlock.length} × ${permutedCandidateBlock.width} × ${permutedCandidateBlock.thickness} mm<br>
            <small>${((permutedCandidateBlock.length * permutedCandidateBlock.width * permutedCandidateBlock.thickness)/1e9).toLocaleString()} m³</small>
        `;
        infoDiv.appendChild(candidateInfo);
    }

    container.appendChild(infoDiv);

    document.getElementById('rotationControls').style.display = 'block';
    document.getElementById('vizLegend').style.display = 'block';

    this.changeView('perspective');
},

/**
 * Orienter le bloc candidat pour correspondre aux dimensions cibles
 */
orientCandidateBlock(candidateBlock, targetDimensions) {
    // Trouver la permutation qui aligne les dimensions du bloc candidat avec les dimensions cibles
    const candidateDims = [
        { dim: 'length', value: candidateBlock.length },
        { dim: 'width', value: candidateBlock.width },
        { dim: 'thickness', value: candidateBlock.thickness }
    ];

    // Trier les dimensions du candidat et de la cible
    candidateDims.sort((a, b) => b.value - a.value);

    const targetDims = [
        { dim: 'length', value: targetDimensions.length },
        { dim: 'width', value: targetDimensions.width },
        { dim: 'thickness', value: targetDimensions.thickness }
    ];

    targetDims.sort((a, b) => b.value - a.value);

    // Créer un objet pour le bloc candidat orienté
    const orientedBlock = {
        length: candidateBlock.length,
        width: candidateBlock.width,
        thickness: candidateBlock.thickness,
        ref: candidateBlock.ref
    };

    // Assigner les dimensions du candidat aux dimensions triées de la cible
    targetDims.forEach((targetDim, index) => {
        orientedBlock[targetDim.dim] = candidateDims[index].value;
    });

    return orientedBlock;
},


    /**
     * Création d'un bloc 3D
     */
    createBlock3D(dimensions, scale, type, label) {
        const length = dimensions.length * scale;
        const width = dimensions.width * scale;
        const thickness = dimensions.thickness * scale;
        
        const boxDiv = document.createElement('div');
        boxDiv.className = 'block-box';
        boxDiv.style.cssText = `
            transform: translate(20%, -60%) translateZ(-${Math.max(length, width, thickness) / 2}px);
        `;
        
        // Définir les faces avec les dimensions
        const faces = [
            {
                name: 'front',
                width: length,
                height: thickness,
                transform: `translateZ(${width / 2}px)`,
                content: type === 'target' ? label : '',
                dimension: `${dimensions.length} × ${dimensions.thickness}`,
                description: 'Face avant (Longueur × Épaisseur)'
            },
            {
                name: 'back',
                width: length,
                height: thickness,
                transform: `rotateY(180deg) translateZ(${width / 2}px)`,
                content: '',
                dimension: `${dimensions.length} × ${dimensions.thickness}`,
                description: 'Face arrière (Longueur × Épaisseur)'
            },
            {
                name: 'right',
                width: width,
                height: thickness,
                transform: `rotateY(90deg) translateZ(${length / 2}px)`,
                content: '',
                dimension: `${dimensions.width} × ${dimensions.thickness}`,
                description: 'Face droite (Largeur × Épaisseur)'
            },
            {
                name: 'left',
                width: width,
                height: thickness,
                transform: `rotateY(-90deg) translateZ(${length / 2}px)`,
                content: '',
                dimension: `${dimensions.width} × ${dimensions.thickness}`,
                description: 'Face gauche (Largeur × Épaisseur)'
            },
            {
                name: 'top',
                width: length,
                height: width,
                transform: `rotateX(90deg) translateZ(${thickness / 2}px)`,
                content: '',
                dimension: `${dimensions.length} × ${dimensions.width}`,
                description: 'Face supérieure (Longueur × Largeur)'
            },
            {
                name: 'bottom',
                width: length,
                height: width,
                transform: `rotateX(-90deg) translateZ(${thickness / 2}px)`,
                content: '',
                dimension: `${dimensions.length} × ${dimensions.width}`,
                description: 'Face inférieure (Longueur × Largeur)'
            }
        ];
        
        faces.forEach(face => {
            const faceDiv = document.createElement('div');
            faceDiv.className = `block-face ${type}-face`;
            faceDiv.style.cssText = `
                width: ${face.width}px;
                height: ${face.height}px;
                transform: ${face.transform};
                left: -${face.width / 2}px;
                top: -${face.height / 2}px;
            `;
            
            if (face.content) {
                faceDiv.textContent = face.content;
            }
            
            // Événements pour le tooltip
            faceDiv.addEventListener('mouseenter', (e) => {
                this.showDimensionTooltip(e, face.dimension, face.description, type);
            });
            
            faceDiv.addEventListener('mouseleave', () => {
                this.hideDimensionTooltip();
            });
            
            faceDiv.addEventListener('mousemove', (e) => {
                this.updateTooltipPosition(e);
            });
            
            boxDiv.appendChild(faceDiv);
        });
        
        return boxDiv;
    },

    /**
     * Changement de vue de la visualisation
     */
    changeView(view) {
        const container = document.getElementById('combinedBoxContainer');
        if (!container) return;
        
        container.classList.remove('show-front', 'show-right', 'show-top', 'show-perspective');
        
        switch(view) {
            case 'front':
                container.style.transform = 'rotateX(0deg) rotateY(0deg)';
                break;
            case 'right':
                container.style.transform = 'rotateX(0deg) rotateY(-90deg)';
                break;
            case 'top':
                container.style.transform = 'rotateX(-90deg) rotateY(0deg)';
                break;
            case 'perspective':
            default:
                container.style.transform = 'rotateX(-15deg) rotateY(25deg)';
                break;
        }
    },

    /**
     * Affichage du tooltip des dimensions
     */
    showDimensionTooltip(event, dimension, description, type) {
        const tooltip = document.getElementById('dimensionTooltip');
        if (!tooltip) return;
        
        const typeLabel = type === 'target' ? 'Cible' : 'Candidat';
        const surplus = this.calculateSurplus(dimension, type);
        
        tooltip.innerHTML = `
            <strong>${typeLabel}</strong><br>
            ${description}<br>
            <strong>${dimension} mm</strong>
            ${surplus ? `<br><small style="color: #fdcb6e;">+${surplus}</small>` : ''}
        `;
        
        tooltip.classList.add('show');
        this.updateTooltipPosition(event);
    },

    /**
     * Masquage du tooltip
     */
    hideDimensionTooltip() {
        const tooltip = document.getElementById('dimensionTooltip');
        if (tooltip) {
            tooltip.classList.remove('show');
        }
    },

    /**
     * Mise à jour de la position du tooltip
     */
    updateTooltipPosition(event) {
        const tooltip = document.getElementById('dimensionTooltip');
        if (!tooltip) return;
        
        tooltip.style.left = (event.pageX + 10) + 'px';
        tooltip.style.top = (event.pageY - 10) + 'px';
    },

    /**
     * Calcul du surplus de dimensions
     */
    calculateSurplus(dimension, type) {
        if (type !== 'candidate' || !currentTargetDimensions || !currentCandidateBlock) {
            return null;
        }
        
        const candidateDims = `${currentCandidateBlock.length} × ${currentCandidateBlock.width}`;
        const targetDims = `${currentTargetDimensions.length} × ${currentTargetDimensions.width}`;
        
        if (dimension.includes('×')) {
            const parts = dimension.split(' × ');
            const dim1 = parseInt(parts[0]);
            const dim2 = parseInt(parts[1]);
            
            if (candidateDims.includes(dim1.toString()) && candidateDims.includes(dim2.toString())) {
                const targetParts = targetDims.split(' × ');
                const targetDim1 = parseInt(targetParts[0]);
                const targetDim2 = parseInt(targetParts[1]);
                
                const surplus1 = dim1 - targetDim1;
                const surplus2 = dim2 - targetDim2;
                
                if (surplus1 > 0 || surplus2 > 0) {
                    return `${surplus1}×${surplus2}mm surplus`;
                }
            }
        }
        
        return null;
    }
};

// ====================================================================
// 9. MODULE EXPORT PDF
// ====================================================================

const PDFExporter = {
    /**
     * Génération d'un PDF avec les détails de découpe
     */
    exportToPDF() {
        if (!optimizationResult || !optimizationResult.candidates || optimizationResult.candidates.length === 0) {
            alert('Aucun résultat à exporter !');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        const selectedCandidate = optimizationResult.candidates[selectedCandidateIndex];
        const targetL = parseInt(document.getElementById('targetLength').value);
        const targetW = parseInt(document.getElementById('targetWidth').value);
        const targetT = parseInt(document.getElementById('targetThickness').value);
        const selectedFamily = document.getElementById('familyFilter').value;

        // En-tête du document
        doc.setFontSize(18);
        doc.setFont(undefined, 'bold');
        doc.text('FICHE DE DÉCOUPE - BE FOURS', 20, 20);

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`Générée le: ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 20, 30);

        if (selectedFamily !== 'all') {
            doc.text(`Famille de matériaux: ${selectedFamily}`, 20, 40);
        }

        if (selectedCandidateIndex === 0) {
            doc.text('CANDIDAT OPTIMAL SÉLECTIONNÉ', 20, 50);
        } else {
            doc.text(`CANDIDAT SÉLECTIONNÉ (Rang #${selectedCandidateIndex + 1})`, 20, 50);
        }

        // Section Objectif de Production
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('BLOC CIBLE - Objectif de production', 20, 65);

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`Dimensions cibles: ${targetL} × ${targetW} × ${targetT} mm`, 20, 75);
        doc.text(`Nombre de pièces: ${selectedCandidate.analysis.totalPieces}`, 20, 80);
        doc.text(`Arrangement: ${selectedCandidate.analysis.arrangement}`, 20, 85);
        doc.text(`Efficacité découpe: ${selectedCandidate.analysis.efficiency.toFixed(1)}%`, 20, 90);

        // Section Bloc Sélectionné
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('BLOC SÉLECTIONNÉ', 20, 105);

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`Référence: ${selectedCandidate.block.ref}`, 20, 115);
        doc.text(`Famille: ${selectedCandidate.block.family}`, 20, 120);
        doc.text(`Qualité: ${selectedCandidate.block.quality}`, 20, 125);
        doc.text(`Dimensions originales: ${selectedCandidate.block.length} × ${selectedCandidate.block.width} × ${selectedCandidate.block.thickness} mm`, 20, 130);
        doc.text(`Stock disponible: ${selectedCandidate.block.quantity} unité(s)`, 20, 135);

        // Section Étapes de Découpe
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('ÉTAPES DE DÉCOUPE', 20, 150);

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        let yPos = 160;
        const cuttingPlan = [];

        if (selectedCandidate.analysis.needsCutL) {
            cuttingPlan.push({
                dimension: 'Longueur',
                pieces: selectedCandidate.analysis.piecesL,
                pieceSize: targetL,
                blockSize: selectedCandidate.block.length,
                waste: selectedCandidate.analysis.lengthWaste,
                cuts: selectedCandidate.analysis.piecesL > 1 ? selectedCandidate.analysis.piecesL - 1 : 1
            });
        }

        if (selectedCandidate.analysis.needsCutW) {
            cuttingPlan.push({
                dimension: 'Largeur',
                pieces: selectedCandidate.analysis.piecesW,
                pieceSize: targetW,
                blockSize: selectedCandidate.block.width,
                waste: selectedCandidate.analysis.widthWaste,
                cuts: selectedCandidate.analysis.piecesW > 1 ? selectedCandidate.analysis.piecesW - 1 : 1
            });
        }

        if (selectedCandidate.analysis.needsCutT) {
            cuttingPlan.push({
                dimension: 'Épaisseur',
                pieces: selectedCandidate.analysis.piecesT,
                pieceSize: targetT,
                blockSize: selectedCandidate.block.thickness,
                waste: selectedCandidate.analysis.thicknessWaste,
                cuts: selectedCandidate.analysis.piecesT > 1 ? selectedCandidate.analysis.piecesT - 1 : 1
            });
        }

        cuttingPlan.forEach((plan) => {
            doc.text(`${plan.dimension}: ${plan.blockSize}mm → ${plan.pieces > 1 ? `${plan.pieces} × ${plan.pieceSize}mm` : `${plan.pieceSize}mm`}`, 20, yPos);
            doc.text(`Découpes: ${plan.cuts} | Chute: ${plan.waste}mm`, 25, yPos + 5);
            yPos += 10;
        });

        // Section Résumé Découpe
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('RÉSUMÉ DÉCOUPE', 20, yPos + 10);

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`Volume bloc original: ${((selectedCandidate.block.length * selectedCandidate.block.width * selectedCandidate.block.thickness)/1000000000).toLocaleString()} m³`, 20, yPos + 20);
        doc.text(`Volume utile produit: ${selectedCandidate.analysis.usedVolume.toLocaleString()} m³`, 20, yPos + 25);
        doc.text(`Volume de chutes: ${selectedCandidate.analysis.wasteVolume.toLocaleString()} m³`, 20, yPos + 30);
        doc.text(`Pourcentage chutes: ${selectedCandidate.analysis.wastePercent.toFixed(1)}%`, 20, yPos + 35);
        doc.text(`Nombre total de découpes: ${selectedCandidate.analysis.cuts}`, 20, yPos + 40);

        const fileName = `Fiche_Decoupe_BEFours_${selectedCandidate.block.ref}_${targetL}x${targetW}x${targetT}.pdf`;
        doc.save(fileName);
    }
};

// ====================================================================
// 10. FONCTIONS PUBLIQUES ET INITIALISATION
// ====================================================================

// Fonctions exposées globalement pour compatibilité avec l'interface
function findBestBlock() {
    OptimizationEngine.findBestBlock();
}

function filterByFamilyAndQuality() {
    FilterManager.filterByFamilyAndQuality();
}

function selectCandidate(index) {
    CandidateManager.selectCandidate(index);
}

function changeView(view) {
    VisualizationManager.changeView(view);
}

function exportToPDF() {
    PDFExporter.exportToPDF();
}

function updateSelectedCandidate(targetL, targetW, targetT) {
    CandidateManager.updateSelectedCandidate(targetL, targetW, targetT);
}

// ====================================================================
// 11. INITIALISATION DE L'APPLICATION
// ====================================================================

/**
 * Initialisation de l'application au chargement du DOM
 */
document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 Optimisateur de Découpe - BE Fours');
    console.log('✅ Support du format Inventaire BE Fours');
    console.log('✅ Filtrage par famille de matériaux réfractaires');
    console.log('✅ 8 familles détectées automatiquement');
    console.log('✅ Interface adaptée aux matériaux industriels');
    console.log('✅ Visualisation 3D avec proportions réelles');

    // Configuration de l'input fichier Excel
    const fileInput = document.getElementById('excelFileInput');
    if (fileInput) {
        fileInput.addEventListener('change', handleExcelFile);
    }

    // Configuration des contrôles de rotation
    const rotationControls = document.querySelector('.rotation-buttons');
    if (rotationControls) {
        rotationControls.addEventListener('change', function(event) {
            if (event.target.name === 'rotate-view') {
                VisualizationManager.changeView(event.target.value);
            }
        });
    }

    // Gestion des événements globaux pour les tooltips
    window.addEventListener('scroll', () => VisualizationManager.hideDimensionTooltip());
    window.addEventListener('resize', () => VisualizationManager.hideDimensionTooltip());
});

// ====================================================================
// 12. DOCUMENTATION DES MODULES
// ====================================================================

/**
 * ARCHITECTURE DU CODE:
 * 
 * 1. CONFIGURATION ET CONSTANTES
 *    - Variables globales
 *    - Configuration des couleurs par famille
 * 
 * 2. MODULE GESTION DES FICHIERS EXCEL
 *    - handleExcelFile(): Import des fichiers Excel
 *    - parseInventaireBEFours(): Parsing des données BE Fours
 *    - loadSampleStock(): Chargement des données d'exemple
 * 
 * 3. MODULE UTILITAIRES DE DONNÉES
 *    - DataUtils.getUniqueFamilies(): Extraction des familles uniques
 *    - DataUtils.getUniqueQualities(): Extraction des qualités uniques
 *    - DataUtils.generatePermutations(): Permutations des dimensions
 * 
 * 4. MODULE GESTION DES FILTRES
 *    - FilterManager.setupFamilyFilter(): Configuration des filtres
 *    - FilterManager.filterByFamilyAndQuality(): Application des filtres
 *    - FilterManager.updateFamilyStats(): Mise à jour des statistiques
 * 
 * 5. MODULE INTERFACE UTILISATEUR
 *    - UIManager.updateStockTable(): Affichage du tableau de stock
 *    - UIManager.updateTargetDisplay(): Affichage des dimensions cibles
 *    - UIManager.displayCandidatesList(): Affichage de la liste des candidats
 * 
 * 6. MODULE ALGORITHME D'OPTIMISATION
 *    - OptimizationEngine.findBestBlock(): Recherche du meilleur bloc
 *    - OptimizationEngine.analyzeBlocks(): Analyse de tous les blocs
 *    - OptimizationEngine.analyzeBlock(): Analyse détaillée d'un bloc
 *    - OptimizationEngine.calculateScore(): Calcul du score d'optimisation
 *    - OptimizationEngine.displayResults(): Affichage des résultats
 * 
 * 7. MODULE GESTION DES CANDIDATS
 *    - CandidateManager.updateSelectedCandidate(): Mise à jour du candidat sélectionné
 *    - CandidateManager.selectCandidate(): Sélection d'un candidat
 *    - CandidateManager.displayCuttingDetailsSimplified(): Détails de découpe
 * 
 * 8. MODULE VISUALISATION 3D
 *    - VisualizationManager.visualizeCombinedBlocks(): Visualisation 3D
 *    - VisualizationManager.createBlock3D(): Création d'un bloc 3D
 *    - VisualizationManager.changeView(): Changement de vue
 *    - Gestion des tooltips et interactions
 * 
 * 9. MODULE EXPORT PDF
 *    - PDFExporter.exportToPDF(): Génération du PDF de découpe
 * 
 * 10. FONCTIONS PUBLIQUES ET INITIALISATION
 *     - Fonctions exposées pour compatibilité avec l'interface HTML
 *     - Initialisation de l'application
 * 
 * AVANTAGES DE L'ORGANISATION:
 * - Code modulaire et maintenable
 * - Séparation claire des responsabilités
 * - Facilité de débogage et de test
 * - Possibilité d'extension facile
 * - Documentation intégrée
 * - Réutilisabilité des modules
 */