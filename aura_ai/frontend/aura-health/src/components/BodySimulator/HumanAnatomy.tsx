import React, { useMemo, useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { useStore, OrganInsights } from "@/store/useStore";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { TbActivity, TbHeart, TbBrain, TbLungs, TbStethoscope } from "react-icons/tb";

export type AnatomyMode = "fullcolor" | "xray" | "hologram";

interface HumanAnatomyProps {
  mode?: AnatomyMode;
  onSelectOrgan?: (organKey: keyof OrganInsights) => void;
  selectedOrgan?: string | null;
}

export default function HumanAnatomy({
  mode = "fullcolor",
  onSelectOrgan,
  selectedOrgan: externalSelectedOrgan,
}: HumanAnatomyProps) {
  const clinicalAssessmentState = useStore((s) => s.clinicalAssessmentState);
  const report = useStore((s) => s.report);
  const setHoveredOrgan = useStore((s) => s.setHoveredOrgan);
  const hoveredOrgan = useStore((s) => s.hoveredOrgan);

  const organInsights = clinicalAssessmentState?.organ_insights || report?.organ_insights;

  const [gltfScene, setGltfScene] = useState<THREE.Group | null>(null);
  const [loadError, setLoadError] = useState<boolean>(false);
  const groupRef = useRef<THREE.Group>(null);
  const originalMaterialsRef = useRef<Map<THREE.Mesh, THREE.Material | THREE.Material[]>>(new Map());

  // Asynchronously load 3D GLTF Anatomy Model
  useEffect(() => {
    let isMounted = true;
    const loader = new GLTFLoader();
    loader.load(
      "/human_anatomy.glb",
      (gltf) => {
        if (isMounted && gltf?.scene) {
          const scene = gltf.scene;

          // Store original GLTF materials (with baseColorTexture)
          scene.traverse((node: any) => {
            if (node.isMesh) {
              node.castShadow = true;
              node.receiveShadow = true;

              if (!originalMaterialsRef.current.has(node)) {
                originalMaterialsRef.current.set(node, node.material);
              }

              // Enhance material for vivid colorful display
              if (node.material) {
                const mat = node.material.clone() as THREE.MeshStandardMaterial;
                if (mat.map) {
                  mat.map.colorSpace = THREE.SRGBColorSpace;
                  mat.map.needsUpdate = true;
                }
                mat.roughness = 0.4;
                mat.metalness = 0.1;
                mat.side = THREE.DoubleSide;
                node.material = mat;
              }
            }
          });

          setGltfScene(scene);
        }
      },
      undefined,
      (err) => {
        console.warn("[3D Digital Twin] Notice loading GLTF:", err);
        if (isMounted) setLoadError(true);
      }
    );
    return () => {
      isMounted = false;
    };
  }, []);

  // Update mesh materials depending on the selected visualization mode
  useEffect(() => {
    if (!gltfScene) return;

    gltfScene.traverse((node: any) => {
      if (node.isMesh) {
        if (mode === "fullcolor") {
          const orig = originalMaterialsRef.current.get(node);
          if (orig) {
            const mat = (Array.isArray(orig) ? orig[0] : orig).clone() as THREE.MeshStandardMaterial;
            mat.transparent = false;
            mat.opacity = 1.0;
            mat.roughness = 0.35;
            mat.metalness = 0.1;
            node.material = mat;
          }
        } else if (mode === "xray") {
          node.material = new THREE.MeshPhysicalMaterial({
            color: "#0284c7",
            transparent: true,
            opacity: 0.25,
            roughness: 0.1,
            transmission: 0.85,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1,
            wireframe: false,
          });
        } else if (mode === "hologram") {
          node.material = new THREE.MeshStandardMaterial({
            color: "#00f0ff",
            wireframe: true,
            transparent: true,
            opacity: 0.4,
            emissive: "#00a8ff",
            emissiveIntensity: 0.6,
          });
        }
      }
    });
  }, [gltfScene, mode]);

  // Breathing & gentle idle animation
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.35) * 0.12;
      groupRef.current.position.y = -0.5 + Math.sin(clock.getElapsedTime() * 0.8) * 0.02;
    }
  });

  const getRiskScore = (organ: string): number | null => {
    const val = organInsights?.[organ as keyof OrganInsights]?.numerical_score;
    return typeof val === "number" ? val : null;
  };

  const getOrganColor = (organ: string): string => {
    const score = getRiskScore(organ);
    if (score === null) return "#38bdf8"; // Cyber Blue (Waiting)
    if (score >= 80) return "#10b981"; // Emerald Healthy
    if (score >= 50) return "#f59e0b"; // Amber Warning
    return "#ef4444"; // Crimson High Risk
  };

  const getOrganStatusText = (organ: string): string => {
    const score = getRiskScore(organ);
    if (score === null) return "Awaiting Data";
    if (score >= 80) return `Optimal (${score}%)`;
    if (score >= 50) return `Moderate (${score}%)`;
    return `Critical (${score}%)`;
  };

  const handleOrganClick = (organKey: keyof OrganInsights) => {
    if (onSelectOrgan) {
      onSelectOrgan(organKey);
    }
  };

  // Anatomical coordinates aligned with 3D model
  const organNodes: Array<{
    key: keyof OrganInsights;
    name: string;
    pos: [number, number, number];
    icon: React.ReactNode;
    color: string;
  }> = [
    { key: "brain", name: "Brain", pos: [0, 1.25, 0.05], icon: <TbBrain />, color: "#ec4899" },
    { key: "heart", name: "Heart", pos: [-0.15, 0.50, 0.25], icon: <TbHeart />, color: "#ef4444" },
    { key: "lungs", name: "Lungs", pos: [0.22, 0.55, 0.12], icon: <TbLungs />, color: "#06b6d4" },
    { key: "liver", name: "Liver", pos: [0.20, 0.15, 0.18], icon: <TbActivity />, color: "#84cc16" },
    { key: "kidneys", name: "Kidneys", pos: [-0.22, -0.15, -0.10], icon: <TbStethoscope />, color: "#f59e0b" },
  ];

  const activeHovered = hoveredOrgan || externalSelectedOrgan;

  return (
    <group ref={groupRef} position={[0, -0.5, 0]} scale={2.8}>
      {/* Primary 3D Anatomy Mesh */}
      {gltfScene ? (
        <primitive object={gltfScene} />
      ) : (
        /* High-Definition Procedural Holographic Avatar Fallback */
        <group>
          {/* Cranium */}
          <mesh position={[0, 1.25, 0]}>
            <sphereGeometry args={[0.26, 32, 32]} />
            <meshPhysicalMaterial color="#0284c7" transparent opacity={0.3} roughness={0.1} transmission={0.9} />
          </mesh>

          {/* Torso */}
          <mesh position={[0, 0.35, 0]}>
            <cylinderGeometry args={[0.36, 0.26, 1.1, 32]} />
            <meshPhysicalMaterial color="#0284c7" transparent opacity={0.25} roughness={0.1} transmission={0.9} />
          </mesh>

          {/* Spine */}
          <mesh position={[0, 0.35, -0.06]}>
            <cylinderGeometry args={[0.04, 0.04, 1.1, 16]} />
            <meshStandardMaterial color="#38bdf8" transparent opacity={0.6} emissive="#0284c7" emissiveIntensity={0.5} />
          </mesh>

          {/* Legs */}
          <mesh position={[-0.16, -0.65, 0]}>
            <cylinderGeometry args={[0.11, 0.07, 1.0, 16]} />
            <meshPhysicalMaterial color="#0284c7" transparent opacity={0.2} />
          </mesh>
          <mesh position={[0.16, -0.65, 0]}>
            <cylinderGeometry args={[0.11, 0.07, 1.0, 16]} />
            <meshPhysicalMaterial color="#0284c7" transparent opacity={0.2} />
          </mesh>
        </group>
      )}

      {/* Embedded Dynamic Organ Hotspots with Illuminated 3D Badges */}
      {organNodes.map((organ) => {
        const isHovered = activeHovered === organ.key;
        const dynamicColor = getOrganColor(organ.key);
        const statusText = getOrganStatusText(organ.key);
        const score = getRiskScore(organ.key);

        return (
          <group
            key={organ.key}
            position={organ.pos}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHoveredOrgan(organ.key);
            }}
            onPointerOut={() => setHoveredOrgan(null)}
            onClick={(e) => {
              e.stopPropagation();
              handleOrganClick(organ.key);
            }}
          >
            {/* Core Illuminated Organ Sphere */}
            <mesh scale={isHovered ? 1.4 : 1.0}>
              <sphereGeometry args={[0.075, 24, 24]} />
              <meshStandardMaterial
                color={dynamicColor}
                emissive={dynamicColor}
                emissiveIntensity={isHovered ? 3.5 : 1.8}
                roughness={0.2}
              />
            </mesh>

            {/* Glowing Pulse Ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]} scale={isHovered ? 1.6 : 1.2}>
              <ringGeometry args={[0.09, 0.11, 32]} />
              <meshBasicMaterial
                color={dynamicColor}
                side={THREE.DoubleSide}
                transparent
                opacity={isHovered ? 0.9 : 0.5}
              />
            </mesh>

            {/* Interactive 3D Label Tooltip */}
            <Html
              position={[0.12, 0.05, 0]}
              distanceFactor={6}
              zIndexRange={[100, 0]}
              style={{ pointerEvents: "auto" }}
            >
              <button
                onClick={() => handleOrganClick(organ.key)}
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-2xl shadow-xl transition-all duration-300 transform border text-left whitespace-nowrap cursor-pointer backdrop-blur-xl ${
                  isHovered
                    ? "scale-110 ring-4 ring-white/30 z-50 bg-slate-950/90 border-white/40 text-white"
                    : "bg-slate-900/80 hover:bg-slate-900 border-white/10 text-slate-200"
                }`}
              >
                <div
                  className="w-7 h-7 rounded-xl flex items-center justify-center text-sm shadow-md"
                  style={{ backgroundColor: `${dynamicColor}25`, color: dynamicColor, borderColor: `${dynamicColor}50` }}
                >
                  {organ.icon}
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-xs tracking-tight text-white">{organ.name}</span>
                    {score !== null && (
                      <span
                        className="text-[10px] font-black px-1.5 py-0.5 rounded-full"
                        style={{ backgroundColor: `${dynamicColor}30`, color: dynamicColor }}
                      >
                        {score}%
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] font-semibold text-slate-400 leading-none mt-0.5">{statusText}</div>
                </div>
              </button>
            </Html>
          </group>
        );
      })}
    </group>
  );
}
