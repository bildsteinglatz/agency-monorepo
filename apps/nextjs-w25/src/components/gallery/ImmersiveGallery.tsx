'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Canvas, useThree, useFrame, useLoader, ThreeEvent } from '@react-three/fiber';
import { PerspectiveCamera, MeshReflectorMaterial } from '@react-three/drei';
import { DragControls as DreiDragControls } from 'three/examples/jsm/controls/DragControls.js';
import * as THREE from 'three';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, collection, addDoc, getDocs, deleteDoc, updateDoc, query, orderBy } from 'firebase/firestore';
import { setLogLevel } from 'firebase/firestore';

import { 
    User as UserIcon, FolderOpen, Image as ImageIcon, Eye, Settings, 
    Plus, Trash2, Upload, Save, X, MoreVertical, Check,
    Palette, LayoutTemplate, Briefcase, ZoomIn
} from 'lucide-react';
import { ArtworkData, GalleryState, PositionArray } from '@/types';

type SavedExhibition = {
  id: string;
  name: string;
  createdAt: number;
  state: GalleryState & {
    manualPositions?: Record<string, PositionArray>;
    activeIds?: string[];
    layoutMode?: 'classic' | 'manual';
    lightValue?: number;
    colorValue?: number;
    gap?: number;
  };
};
import { useGalleryLayout } from '@/hooks/useGalleryLayout';
import { CameraRig } from './immersive/CameraRig';
import { PanHandler } from './immersive/PanHandler';
import { PaintingFrame } from './immersive/PaintingFrame';
import { Environment } from './immersive/Environment';
import { SizeReferenceFigure } from './immersive/SizeReferenceFigure';

// Set Firebase log level for debugging
setLogLevel('debug');


// --- Layout Hook Logic ---

const GALLERY_CENTER_Y = 0.00;

// --- Shared Constants and Data ---
const Themes = {
  white: { wallColor: '#ffffff', floorColor: '#e0e0e0', lightIntensity: 1.5, ambientIntensity: 1.0, textColor: '#1a1a1a' },
  dark: { wallColor: '#333333', floorColor: '#1a1a1a', lightIntensity: 0.8, ambientIntensity: 0.2, textColor: '#f0f0f0' },
  grey: { wallColor: '#606060', floorColor: '#444444', lightIntensity: 1.0, ambientIntensity: 0.3, textColor: '#ffffff' },
};

declare const __app_id: string | undefined;
declare const __initial_auth_token: string | undefined;

// --- Firebase Initialization and Auth ---
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

let db: any = null;
let auth: any = null;
const GALLERY_STATE_DOC_PATH = (userId: string) => `/artifacts/${appId}/users/${userId}/galleryState/current`;

// Utility function for debounce
const debounce = (func: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: any) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// --- R3F Components ---
// Components moved to ./immersive/ folder








// --- Texture Preloader Hook ---
const useArtworkTextures = (artworkData: ArtworkData[]) => {
    const [textureMap, setTextureMap] = useState<Record<string, { full: THREE.Texture, low: THREE.Texture, isLoading: boolean }>>({});
    const [isTextureLoading, setIsTextureLoading] = useState(true);

    useEffect(() => {
        // Create placeholder
        const placeholder = (() => {
            if (typeof document === 'undefined') return new THREE.Texture();
            const canvas = document.createElement('canvas');
            canvas.width = 2;
            canvas.height = 2;
            const ctx = canvas.getContext('2d');
            if (ctx) { ctx.fillStyle = '#cccccc'; ctx.fillRect(0, 0, 2, 2); }
            return new THREE.CanvasTexture(canvas);
        })();

        // Init map with placeholders
        const map: Record<string, any> = {};
        artworkData.forEach(item => {
            map[item._id] = { full: placeholder, low: placeholder, isLoading: true };
        });
        setTextureMap(map);

        const loader = new THREE.TextureLoader();
        loader.setCrossOrigin('anonymous');
        let loaded = 0;
        const total = artworkData.length;

        if (total === 0) { setIsTextureLoading(false); return; }

        artworkData.forEach(item => {
            if (!item.imageUrl) {
                loaded++;
                if (loaded === total) setIsTextureLoading(false);
                return;
            }
            loader.load(
                item.imageUrl,
                (tex) => {
                    tex.colorSpace = THREE.SRGBColorSpace;
                    setTextureMap(prev => ({
                        ...prev,
                        [item._id]: { full: tex, low: tex, isLoading: false }
                    }));
                    loaded++;
                    if (loaded === total) setIsTextureLoading(false);
                },
                undefined,
                (err) => {
                    console.warn('Failed to load texture:', item.title, err);
                    loaded++;
                    if (loaded === total) setIsTextureLoading(false);
                }
            );
        });
    }, [artworkData]);

    return { textureMap, isTextureLoading };
};


// --- Main Gallery Component ---

export const ImmersiveGallery = ({ initialArtworkData }: { initialArtworkData?: ArtworkData[] }) => {
    // State
    const [artworkData] = useState<ArtworkData[]>(initialArtworkData || []); 
    const [activeIds, setActiveIds] = useState<string[]>(() => {
        if (initialArtworkData && initialArtworkData.length > 0) {
            return initialArtworkData.slice(0, 5).map(a => a._id);
        }
        return ['1', '2', '3'];
    }); 
    const [focusedId, setFocusedId] = useState<string | null>(null);
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [zoom, setZoom] = useState(6);
    const [pan, setPan] = useState<[number, number]>([0, 0]);
    const [mode, setMode] = useState<'view' | 'edit'>('view');
    const [showHelp, setShowHelp] = useState(true);

    const [layoutMode, setLayoutMode] = useState<'classic' | 'manual'>('classic');
    const [lightValue, setLightValue] = useState(100); // Default Bright
    const [colorValue, setColorValue] = useState(0);   // Default White
    const [gap, setGap] = useState(0.5); 
    const [manualPositions, setManualPositions] = useState<Record<string, PositionArray>>({});

    const [firestoreExhibitions, setFirestoreExhibitions] = useState<SavedExhibition[]>([]);
    const [localExhibitions, setLocalExhibitions] = useState<SavedExhibition[]>([]);
    const exhibitions = useMemo(() => [...firestoreExhibitions, ...localExhibitions].sort((a,b) => b.createdAt - a.createdAt), [firestoreExhibitions, localExhibitions]);

    const [currentExhibitionId, setCurrentExhibitionId] = useState<string | null>(null);
    const [newExhibitionName, setNewExhibitionName] = useState('');

    const [isAuthReady, setIsAuthReady] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);
    const [isDataLoading, setIsDataLoading] = useState(true); 
    const [isError, setIsError] = useState(false); 
    
    const [user, setUser] = useState<User | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<'connected' | 'offline' | 'disconnected'>('disconnected');

    // --- New UI State ---
    const [activeTab, setActiveTab] = useState<'EXHIBITIONS' | 'ARTWORKS' | 'MOOD' | 'SETTINGS' | 'CURATOR'>('EXHIBITIONS');
    const [isPanelOpen, setIsPanelOpen] = useState(true);

    const activeItems = artworkData.filter(a => activeIds.includes(a._id));
    
    // Texture Pre-loading
    const { textureMap, isTextureLoading: isAssetLoading } = useArtworkTextures(artworkData);


    // --- Firebase Init and Auth ---
    useEffect(() => {
        if (!firebaseConfig.apiKey) {
            console.error("Firebase API Key is missing. Check your environment variables.");
            setIsError(true);
            return;
        }
        
        try {
            const app = initializeApp(firebaseConfig);
            db = getFirestore(app);
            auth = getAuth(app);
            
            const unsubscribe = onAuthStateChanged(auth, async (user) => {
                setUser(user);
                if (user) {
                    setIsAuthReady(true);
                    setConnectionStatus('connected');
                } else {
                    setConnectionStatus('disconnected');
                    // Strict Approach: Do not force anonymous sign-in.
                    // Users must log in via the main dashboard to access authenticated features.
                    setIsAuthReady(true);
                }
            });
            return () => unsubscribe();
        } catch (error) {
            console.error("Firebase initialization failed:", error);
            setIsError(true);
        }
    }, []);

    // --- Firestore Load ---
    useEffect(() => {
        if (!isAuthReady || !db || !auth || !auth.currentUser) return;
        
        const userId = auth.currentUser.uid;
        const docRef = doc(db, GALLERY_STATE_DOC_PATH(userId));
        
        const unsubscribe = onSnapshot(docRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
                // Cast to a type that extends GalleryState with optional UI-related fields
                const loadedState = docSnapshot.data() as unknown as (GalleryState & { lightValue?: number; colorValue?: number; gap?: number });
                setManualPositions(loadedState.manualPositions || {});
                setActiveIds(loadedState.activeIds || activeIds); 
                setLayoutMode(loadedState.layoutMode || 'classic');
                setLightValue(loadedState.lightValue !== undefined ? loadedState.lightValue : 100);
                setColorValue(loadedState.colorValue !== undefined ? loadedState.colorValue : 0);
            }

            setIsDataLoading(false);
        }, (error) => {
            console.error("Error loading gallery state from Firestore:", error);
            setIsDataLoading(false);
            setIsError(true); 
        });

        return () => unsubscribe();
    }, [isAuthReady]);

    // --- Firestore Save ---
    const saveStateToFirestore = useCallback(debounce(async (stateToSave: GalleryState) => {
        if (!db || !auth || !auth.currentUser) return;
        const userId = auth.currentUser.uid;
        const docRef = doc(db, GALLERY_STATE_DOC_PATH(userId));
        
        try {
            await setDoc(docRef, stateToSave, { merge: true });
        } catch (error) {
            console.error("Failed to save gallery state to Firestore:", error);
        }
    }, 500), [db, auth]); 

    // Watcher for state changes to trigger save
    useEffect(() => {
        if (!db || !auth || !auth.currentUser || isDataLoading) return;
        const currentState = {
            manualPositions,
            activeIds,
            layoutMode,
            lightValue,
            colorValue,
            gap
        } as GalleryState & { lightValue?: number; colorValue?: number; gap?: number };
        
        saveStateToFirestore(currentState as GalleryState);
    }, [manualPositions, activeIds, layoutMode, lightValue, colorValue, gap, saveStateToFirestore, isDataLoading]);

    // Help Overlay Timer
    useEffect(() => {
        const timer = setTimeout(() => setShowHelp(false), 4000);
        return () => clearTimeout(timer);
    }, []);


    // --- Exhibition Management Logic ---
    const EXHIBITIONS_COLLECTION_PATH = (userId: string) => `/artifacts/${appId}/users/${userId}/exhibitions`;

    // Real-time subscription for exhibitions
    useEffect(() => {
        // Load Local Storage
        const local = localStorage.getItem('w25_exhibitions');
        if (local) {
            try {
                setLocalExhibitions(JSON.parse(local));
            } catch (e) {
                console.error("Failed to parse local exhibitions", e);
            }
        }

        if (!isAuthReady || !db || !auth || !auth.currentUser) return;
        const userId = auth.currentUser.uid;
        const colRef = collection(db, EXHIBITIONS_COLLECTION_PATH(userId));
        const q = query(colRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const loadedExhibitions: SavedExhibition[] = [];
            snapshot.forEach(doc => {
                loadedExhibitions.push({ id: doc.id, ...doc.data() } as SavedExhibition);
            });
            setFirestoreExhibitions(loadedExhibitions);
        }, (error) => {
            console.error("Error fetching exhibitions:", error);
        });

        return () => unsubscribe();
    }, [isAuthReady]);

    const saveNewExhibition = async () => {
        if (!newExhibitionName.trim()) {
            alert("Please enter a name for the exhibition.");
            return;
        }

        const currentState = {
            manualPositions,
            activeIds,
            layoutMode,
            lightValue,
            colorValue,
            gap
        } as GalleryState & { lightValue?: number; colorValue?: number; gap?: number };

        const newExhibition = {
            name: newExhibitionName,
            createdAt: Date.now(),
            state: currentState
        };

        // Try Firestore first
        if (db && auth && auth.currentUser) {
            try {
                const userId = auth.currentUser.uid;
                const colRef = collection(db, EXHIBITIONS_COLLECTION_PATH(userId));
                const docRef = await addDoc(colRef, newExhibition);
                setNewExhibitionName('');
                setCurrentExhibitionId(docRef.id);
                alert('Exhibition saved (Cloud)!');
                return;
            } catch (error) {
                console.error("Error saving to cloud, falling back to local:", error);
            }
        }

        // Fallback to LocalStorage
        try {
            const localId = `local-${Date.now()}`;
            const localExhibition = { ...newExhibition, id: localId };
            const updatedLocal = [localExhibition, ...localExhibitions];
            setLocalExhibitions(updatedLocal);
            localStorage.setItem('w25_exhibitions', JSON.stringify(updatedLocal));
            setNewExhibitionName('');
            setCurrentExhibitionId(localId);
            alert('Exhibition saved (Local)!');
        } catch (error) {
            console.error("Error saving locally:", error);
            alert('Failed to save exhibition.');
        }
    };
    const updateCurrentExhibition = async () => {
        if (!currentExhibitionId) return;

        const currentState = {
            manualPositions,
            activeIds,
            layoutMode,
            lightValue,
            colorValue,
            gap
        } as GalleryState & { lightValue?: number; colorValue?: number; gap?: number };

        // Local Update
        if (currentExhibitionId.startsWith('local-')) {
            const updatedLocal = localExhibitions.map(e => 
                e.id === currentExhibitionId 
                ? { ...e, state: currentState } 
                : e
            );
            setLocalExhibitions(updatedLocal);
            localStorage.setItem('w25_exhibitions', JSON.stringify(updatedLocal));
            alert('Exhibition updated (Local)!');
            return;
        }

        // Cloud Update
        if (!db || !auth || !auth.currentUser) return;
        const userId = auth.currentUser.uid;
        const docRef = doc(db, `${EXHIBITIONS_COLLECTION_PATH(userId)}/${currentExhibitionId}`);

        try {
            await updateDoc(docRef, { state: currentState });
            alert('Exhibition updated!');
        } catch (error) {
            console.error("Error updating exhibition:", error);
            alert('Failed to update exhibition.');
        }
    };
    const loadExhibition = (exhibition: SavedExhibition) => {
        setManualPositions(exhibition.state.manualPositions || {});
        setActiveIds(exhibition.state.activeIds || []);
        setLayoutMode(exhibition.state.layoutMode || 'classic');
        setLightValue(exhibition.state.lightValue !== undefined ? exhibition.state.lightValue : 100);
        setColorValue(exhibition.state.colorValue !== undefined ? exhibition.state.colorValue : 0);
        setGap(exhibition.state.gap !== undefined ? exhibition.state.gap : 0.5);
        setCurrentExhibitionId(exhibition.id);
    };

    const deleteExhibition = async (id: string) => {
        if (!confirm('Are you sure you want to delete this exhibition?')) return;

        // Local Delete
        if (id.startsWith('local-')) {
            const updatedLocal = localExhibitions.filter(e => e.id !== id);
            setLocalExhibitions(updatedLocal);
            localStorage.setItem('w25_exhibitions', JSON.stringify(updatedLocal));
            if (currentExhibitionId === id) setCurrentExhibitionId(null);
            return;
        }

        // Cloud Delete
        if (!db || !auth || !auth.currentUser) return;
        const userId = auth.currentUser.uid;
        const docRef = doc(db, `${EXHIBITIONS_COLLECTION_PATH(userId)}/${id}`);
        
        try {
            await deleteDoc(docRef);
            if (currentExhibitionId === id) setCurrentExhibitionId(null);
            // No need to manually fetch, onSnapshot will handle it
        } catch (error) {
            console.error("Error deleting exhibition:", error);
        }
    };


    // --- Interaction Handlers ---
    const toggleActive = (id: string) => {
        setActiveIds(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
        setFocusedId(null); 
    };

    const handlePaintingClick = (id: string) => {
        if (mode === 'edit') return; // In edit mode, click doesn't zoom. Dragging handles position.

        if (focusedId === id) {
            setFocusedId(null);
        } else {
            setFocusedId(id);
            setPan([0, 0]); // Reset pan to center the painting
            
            // Auto-zoom disabled per user request
            /*
            const item = artworkData.find(a => a._id === id);
            if (item) {
                const targetZ = Math.max(1.5, (item.dimensions.height / 100) * 1.2) + 0.5;
                setZoom(targetZ);
            }
            */
        }
    };

    const handlePan = useCallback((dx: number, dy: number) => {
        setPan(prev => [prev[0] + dx, prev[1] + dy]);
    }, []);

    // --- Layout Integration ---
    const targetPositions = useGalleryLayout(activeItems, layoutMode, gap, manualPositions);
    
    const handleDragEnd = useCallback((id: string, newPosition: PositionArray) => {
        setManualPositions(prev => ({
            ...prev,
            [id]: newPosition
        }));
    }, []);

    // --- Rendering Logic ---

    if (isError) {
        return (
            <div className="flex items-center justify-center h-full w-full bg-gray-900 text-white p-8">
                <p className="text-xl">Error: An error occurred during initialization or data loading. Please check the console.</p>
            </div>
        );
    }
    
    // Wait for both Firetore data and R3F assets to be ready
    if (!isAuthReady || isDataLoading || isAssetLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full w-full bg-gray-900 text-white p-8 font-sans">
                <div className="w-64 space-y-6">
                    <h2 className="text-2xl font-light mb-8 text-center tracking-widest uppercase text-gray-400">Initializing</h2>
                    
                    {/* Step 1: Settings / Auth */}
                    <div className="flex items-center space-x-4">
                        {isAuthReady ? (
                            <div className="text-green-500"><Check size={20} /></div>
                        ) : (
                            <div className="animate-spin h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
                        )}
                        <span className={`text-sm tracking-wide ${isAuthReady ? "text-gray-500" : "text-white font-medium"}`}>Loading Settings</span>
                    </div>

                    {/* Step 2: Artworks / Assets */}
                    <div className="flex items-center space-x-4">
                        {!isAuthReady ? (
                            <div className="w-5 h-5 rounded-full border-2 border-gray-800"></div>
                        ) : !isAssetLoading ? (
                            <div className="text-green-500"><Check size={20} /></div>
                        ) : (
                            <div className="animate-spin h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
                        )}
                        <span className={`text-sm tracking-wide ${!isAuthReady ? "text-gray-700" : !isAssetLoading ? "text-gray-500" : "text-white font-medium"}`}>Loading Artworks</span>
                    </div>

                    {/* Step 3: Exhibitions / Data */}
                    <div className="flex items-center space-x-4">
                        {!isAuthReady || isAssetLoading ? (
                            <div className="w-5 h-5 rounded-full border-2 border-gray-800"></div>
                        ) : !isDataLoading ? (
                            <div className="text-green-500"><Check size={20} /></div>
                        ) : (
                            <div className="animate-spin h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
                        )}
                        <span className={`text-sm tracking-wide ${!isAuthReady || isAssetLoading ? "text-gray-700" : !isDataLoading ? "text-gray-500" : "text-white font-medium"}`}>Loading Exhibitions</span>
                    </div>
                </div>
            </div>
        );
    }

    // --- HTML Overlay Components ---
    
    const focusedArt = artworkData.find(a => a._id === focusedId);
    const activeExhibition = exhibitions.find(e => e.id === currentExhibitionId);

    const TabButton = ({ id, icon: Icon, label }: { id: typeof activeTab, icon: any, label: string }) => (
        <button 
            onClick={() => {
                if (activeTab === id) setIsPanelOpen(!isPanelOpen);
                else { setActiveTab(id); setIsPanelOpen(true); }
            }}
            className={`p-2 transition-all duration-200 group relative flex items-center justify-center
                ${activeTab === id && isPanelOpen ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-700 hover:bg-gray-100 hover:text-indigo-600'}
            `}
            title={label}
        >
            <Icon size={20} strokeWidth={2} />
        </button>
    );

    // --- Main R3F Canvas ---
    return (
        <div className="h-full w-full relative">
            <Canvas shadows className="bg-gray-100">
                <Environment lightValue={lightValue} colorValue={colorValue} />
                <SizeReferenceFigure />
                <CameraRig focusedId={focusedId} targetPositions={targetPositions} zoom={zoom} pan={pan} />
                <PanHandler onPan={handlePan} />
                
                {/* Render active paintings */}
                {activeItems.map(item => {
                    const targetPos = targetPositions[item._id] || new THREE.Vector3(0, GALLERY_CENTER_Y, -0.1); 
                    const textureData = textureMap[item._id];

                    if (!textureData) return null; // Should not happen if data is loaded, but as a guard

                    // Determine which texture to use based on focus (LOD)
                    const displayTexture = focusedId === item._id ? textureData.full : textureData.low;

                    return (
                        <PaintingFrame
                            key={item._id}
                            item={item}
                            position={targetPos}
                            isFocused={item._id === focusedId}
                            onClick={() => handlePaintingClick(item._id)}
                            dragEnabled={layoutMode === 'manual'}
                            onDragEnd={(newPos) => handleDragEnd(item._id, newPos)}
                            texture={displayTexture}
                            isLoading={textureData.isLoading}
                        />
                    );
                })}
            </Canvas>
            
            {/* --- New Unified Sidebar UI --- */}
            <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-start font-sans">
                
                {/* The Mini Control Panel */}
                <div className="flex bg-white/20 backdrop-blur-md overflow-hidden pointer-events-auto max-h-[90vh]">
                    
                    {/* 1. Icon Rail (Always Visible) */}
                    <div className="w-10 flex flex-col items-center py-2 gap-1 bg-white/10">
                        <div className={`w-2 h-2 rounded-full mb-2 ${isAuthReady && auth?.currentUser ? 'bg-green-500' : 'bg-red-500'}`} title={isAuthReady && auth?.currentUser ? "Online" : "Offline"} />
                        
                        <TabButton id="EXHIBITIONS" icon={LayoutTemplate} label="Exhibitions" />
                        <TabButton id="ARTWORKS" icon={ImageIcon} label="Artworks" />
                        <TabButton id="MOOD" icon={Palette} label="Mood" />
                        <TabButton id="CURATOR" icon={Briefcase} label="Curator Mode" />
                        <div className="w-8 h-[1px] bg-gray-200 my-1" />
                        <TabButton id="SETTINGS" icon={Settings} label="Settings" />
                    </div>

                    {/* 2. Content Panel (Collapsible) */}
                    {isPanelOpen && (
                        <div className="w-72 flex flex-col bg-white/10">
                            
                            {/* Header */}
                            <div className="p-4 border-b border-white/20 flex justify-between items-center bg-white/10">
                                <div className="font-black italic text-gray-900 text-sm tracking-wide">
                                    {activeTab === 'EXHIBITIONS' && 'EXHIBITION MANAGER'}
                                    {activeTab === 'ARTWORKS' && 'ARTWORK SELECTOR'}
                                    {activeTab === 'MOOD' && 'MOOD SETTINGS'}
                                    {activeTab === 'CURATOR' && 'CURATOR MODE'}
                                    {activeTab === 'SETTINGS' && 'APP SETTINGS'}
                                </div>
                                <button onClick={() => setIsPanelOpen(false)} className="text-gray-700 hover:text-gray-900">
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Body Scroll Area */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                                
                                {/* --- TAB: EXHIBITIONS (Browser) --- */}
                                {activeTab === 'EXHIBITIONS' && (
                                    <div className="space-y-4">
                                        {/* Cloud / Admin Exhibitions */}
                                        <div>
                                            <div className="text-xs font-black italic text-gray-900 uppercase mb-2">Featured Galleries</div>
                                            {firestoreExhibitions.length === 0 && <p className="text-xs text-gray-600 italic py-2">No featured exhibitions</p>}
                                            {firestoreExhibitions.map(ex => (
                                                <div key={ex.id} 
                                                    onClick={() => loadExhibition(ex)}
                                                    className={`group flex items-center gap-3 p-2 cursor-pointer transition-colors mb-1 ${currentExhibitionId === ex.id ? 'bg-indigo-50' : 'hover:bg-white hover:shadow-sm'}`}
                                                >
                                                    <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-gray-600">
                                                        <LayoutTemplate size={16} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="truncate text-sm text-gray-800 font-medium">{ex.name}</div>
                                                        <div className="text-[10px] text-gray-600">Cloud • {new Date(ex.createdAt).toLocaleDateString()}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Personal / Local Exhibitions */}
                                        <div>
                                            <div className="text-xs font-black italic text-gray-900 uppercase mb-2">My Collection</div>
                                            {localExhibitions.length === 0 && <p className="text-xs text-gray-600 italic py-2">No personal exhibitions</p>}
                                            {localExhibitions.map(ex => (
                                                <div key={ex.id} 
                                                    onClick={() => loadExhibition(ex)}
                                                    className={`group flex items-center gap-3 p-2 cursor-pointer transition-colors mb-1 ${currentExhibitionId === ex.id ? 'bg-amber-50' : 'hover:bg-white hover:shadow-sm'}`}
                                                >
                                                    <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-gray-600">
                                                        <FolderOpen size={16} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="truncate text-sm text-gray-800 font-medium">{ex.name}</div>
                                                        <div className="text-[10px] text-gray-600">Local • {new Date(ex.createdAt).toLocaleDateString()}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* --- TAB: ARTWORKS --- */}
                                {activeTab === 'ARTWORKS' && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-black italic text-gray-900 uppercase">Available Artworks</span>
                                            <span className="text-xs bg-gray-200 px-1.5 rounded-full text-gray-800">{activeIds.length} / {artworkData.length}</span>
                                        </div>
                                        {artworkData.map(item => {
                                            const isActive = activeIds.includes(item._id);
                                            return (
                                                <div key={item._id} className="flex items-center gap-3 p-2 bg-white/20 hover:bg-white transition-colors">
                                                    {/* Thumbnail */}
                                                    <div className="w-10 h-10 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                                                        {item.imageUrl ? (
                                                            <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-600"><ImageIcon size={14}/></div>
                                                        )}
                                                    </div>
                                                    
                                                    <div 
                                                        className="flex-1 min-w-0 cursor-pointer"
                                                        onClick={() => {
                                                            if (!isActive) toggleActive(item._id);
                                                            handlePaintingClick(item._id);
                                                        }}
                                                    >
                                                        <div className={`text-sm truncate ${isActive ? 'font-medium text-gray-900' : 'text-gray-700'}`}>{item.title}</div>
                                                        <div className="text-[10px] text-gray-500 truncate">{item.artist}</div>
                                                    </div>

                                                    <button 
                                                        onClick={() => toggleActive(item._id)}
                                                        className={`p-1.5 rounded-full transition-colors ${isActive ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                                                    >
                                                        {isActive ? <Check size={14} /> : <Plus size={14} />}
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* --- TAB: MOOD (Lighting & Color) --- */}
                                {activeTab === 'MOOD' && (
                                    <div className="space-y-6">
                                        {/* Lighting Control */}
                                        <div className="bg-white/20 p-4 shadow-sm">
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="text-xs font-black italic text-gray-900 uppercase">Lighting Intensity</span>
                                                <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-800">{lightValue}%</span>
                                            </div>
                                            <input 
                                                type="range" min="0" max="100" value={lightValue} 
                                                onChange={(e) => setLightValue(parseInt(e.target.value))}
                                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                            />
                                            <div className="flex justify-between text-[10px] text-gray-600 mt-1">
                                                <span>Dark</span>
                                                <span>Bright</span>
                                            </div>
                                        </div>

                                        {/* Wall Color Control */}
                                        <div className="bg-white/20 p-4 shadow-sm">
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="text-xs font-black italic text-gray-900 uppercase">Wall Color</span>
                                            </div>
                                            <input 
                                                type="range" min="0" max="100" value={colorValue} 
                                                onChange={(e) => setColorValue(parseInt(e.target.value))}
                                                className="w-full h-2 bg-gradient-to-r from-white via-gray-500 to-black rounded-lg appearance-none cursor-pointer"
                                            />
                                            <div className="flex justify-between text-[10px] text-gray-600 mt-1">
                                                <span>Light</span>
                                                <span>Dark</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* --- TAB: SETTINGS --- */}
                                {activeTab === 'SETTINGS' && (
                                    <div className="space-y-6">
                                        {/* Stats Section */}
                                        <div className="bg-white/20 p-4 shadow-sm">
                                            <div className="text-xs font-black italic text-gray-900 uppercase tracking-wider mb-3">Statistics</div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="bg-white p-3 text-center">
                                                    <div className="text-2xl font-bold text-gray-900">{exhibitions.length}</div>
                                                    <div className="text-xs text-gray-600">Exhibitions</div>
                                                </div>
                                                <div className="bg-white p-3 text-center">
                                                    <div className="text-2xl font-bold text-gray-900">{artworkData.length}</div>
                                                    <div className="text-xs text-gray-600">Artworks</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* App Info */}
                                        <div className="text-center pt-4 border-t border-gray-200/50">
                                            <p className="text-xs text-gray-600">Immersive Gallery v1.0</p>
                                            <p className="text-[10px] text-gray-500 mt-1">Next.js • Three.js • Firestore</p>
                                        </div>
                                    </div>
                                )}

                                {/* --- TAB: CURATOR (Workstation) --- */}
                                {activeTab === 'CURATOR' && (
                                    <div className="space-y-6">
                                        
                                        {/* User / Login Section */}
                                        <div className="bg-white/20 p-4 shadow-sm">
                                            <div className="text-xs font-black italic text-gray-900 uppercase tracking-wider mb-3">Curator Profile</div>
                                            
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
                                                    {user?.isAnonymous ? 'G' : 'C'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-gray-900 truncate">
                                                        {user?.isAnonymous ? 'Guest Curator' : 'Registered Curator'}
                                                    </div>
                                                    <div className="text-xs text-gray-600 font-mono truncate">
                                                        {user?.uid ? user.uid.slice(0,8) + '...' : 'Not connected'}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 text-xs bg-gray-50 p-2 mb-3">
                                                <div className={`w-2 h-2 rounded-full ${
                                                    connectionStatus === 'connected' ? 'bg-green-500' : 
                                                    connectionStatus === 'offline' ? 'bg-orange-500' : 'bg-red-500'
                                                }`} />
                                                <span className="font-medium text-gray-800">
                                                    {connectionStatus === 'connected' ? 'Cloud Sync Active' : 
                                                     connectionStatus === 'offline' ? 'Offline Mode' : 'Disconnected'}
                                                </span>
                                            </div>
                                            
                                            {/* Login/Logout Actions would go here */}
                                        </div>

                                        {/* Current Exhibition Management */}
                                        <div className="bg-indigo-50 p-4 shadow-sm">
                                            <div className="text-xs font-black italic text-gray-900 uppercase tracking-wider mb-3">Active Exhibition</div>
                                            
                                            <div className="mb-3">
                                                <label className="text-[10px] text-gray-800 font-bold uppercase mb-1 block">Title</label>
                                                <input 
                                                    className="w-full bg-white px-2 py-1.5 text-sm outline-none focus:border-indigo-500 text-indigo-900 font-medium"
                                                    placeholder="Untitled Exhibition"
                                                    value={activeExhibition ? activeExhibition.name : newExhibitionName}
                                                    onChange={e => setNewExhibitionName(e.target.value)}
                                                />
                                            </div>

                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={saveNewExhibition}
                                                    className="flex-1 py-2 bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 flex items-center justify-center gap-1 shadow-sm"
                                                >
                                                    <Save size={14} /> {currentExhibitionId ? 'Update' : 'Save New'}
                                                </button>
                                                {currentExhibitionId && (
                                                    <button 
                                                        onClick={() => {
                                                            setCurrentExhibitionId(null);
                                                            setNewExhibitionName('');
                                                        }}
                                                        className="px-3 py-2 bg-white text-indigo-600 text-xs font-bold hover:bg-indigo-50"
                                                        title="Clear / New"
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Layout Tools */}
                                        <div className="bg-white/20 p-4 shadow-sm">
                                            <div className="text-xs font-black italic text-gray-900 uppercase tracking-wider mb-3">Layout Tools</div>
                                            
                                            {/* Mode Toggle */}
                                            <div className="flex bg-gray-100 p-1 mb-4">
                                                <button 
                                                    onClick={() => setLayoutMode('classic')}
                                                    className={`flex-1 py-1.5 text-xs font-medium transition-all ${layoutMode === 'classic' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
                                                >
                                                    Auto Grid
                                                </button>
                                                <button 
                                                    onClick={() => setLayoutMode('manual')}
                                                    className={`flex-1 py-1.5 text-xs font-medium transition-all ${layoutMode === 'manual' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
                                                >
                                                    Manual Drag
                                                </button>
                                            </div>

                                            {/* Spacing Slider */}
                                            <div className="mb-2">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-xs text-gray-600 font-medium">Artwork Spacing</span>
                                                    <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded">{gap}m</span>
                                                </div>
                                                <input 
                                                    type="range" min="0.1" max="2.0" step="0.1" value={gap} 
                                                    onChange={(e) => setGap(parseFloat(e.target.value))}
                                                    className="w-full h-2 bg-gray-200 appearance-none cursor-pointer accent-gray-600"
                                                />
                                            </div>
                                        </div>

                                        {/* My Exhibitions List (Quick Access) */}
                                        <div className="bg-white/20 p-4 shadow-sm">
                                            <div className="text-xs font-black italic text-gray-900 uppercase tracking-wider mb-3">My Saved Exhibitions</div>
                                            <div className="space-y-1 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                                                {exhibitions.map(ex => (
                                                    <div key={ex.id} className="flex items-center justify-between group">
                                                        <button 
                                                            onClick={() => loadExhibition(ex)}
                                                            className={`flex-1 text-left text-xs py-1.5 px-2 truncate transition-colors ${currentExhibitionId === ex.id ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
                                                        >
                                                            {ex.name}
                                                        </button>
                                                        <button 
                                                            onClick={(e) => {e.stopPropagation(); deleteExhibition(ex.id)}} 
                                                            className="p-1 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <Trash2 size={12}/>
                                                        </button>
                                                    </div>
                                                ))}
                                                {exhibitions.length === 0 && <p className="text-xs text-gray-600 italic">No saved exhibitions</p>}
                                            </div>
                                        </div>

                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Zoom Slider Control */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-auto bg-white/20 backdrop-blur-md px-6 py-3 shadow-lg flex items-center gap-4 z-40 transition-all hover:bg-white/30 hover:shadow-xl">
                    <span className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                        <ZoomIn size={14} /> Zoom
                    </span>
                    <input 
                        type="range" 
                        min="2" 
                        max="30" 
                        step="0.1" 
                        value={zoom} 
                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                        className="w-48 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-700"
                    />
                    <span className="text-xs font-mono text-gray-700 w-8 text-right">{Math.round(zoom)}m</span>
                </div>

                {/* Bottom Info - Details Panel (Only visible when art is focused) */}
                {focusedArt && (
                    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 max-w-lg w-full bg-white/20 backdrop-blur-md p-6 shadow-2xl pointer-events-auto transition-all duration-300">
                        <button 
                            onClick={() => setFocusedId(null)}
                            className="absolute top-2 right-2 p-1 text-gray-600 hover:text-gray-800"
                        >
                            <X size={20} />
                        </button>
                        <h2 className="text-2xl font-bold mb-1 text-gray-900">{focusedArt.title}</h2>
                        <p className="text-base text-gray-600 mb-3 font-medium">{focusedArt.artist}, {focusedArt.year}</p>
                        <div className="flex gap-2 mb-4">
                            <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">{focusedArt.technique}</span>
                            <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">{focusedArt.dimensions.width} x {focusedArt.dimensions.height} cm</span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed max-h-32 overflow-y-auto pr-2 custom-scrollbar">{focusedArt.description}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Size Reference Figure ---
