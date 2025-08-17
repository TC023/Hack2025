import React, { useEffect, useRef } from 'react';
import { GLView } from 'expo-gl';
import * as THREE from 'three';
import { Renderer } from 'expo-three';
import { Asset } from 'expo-asset';
// @ts-ignore
import { GLTFLoader } from 'three-stdlib';

// Basic AR cube + optional model loader example
export const ARScene: React.FC = () => {
  const glRef = useRef<any>(null);
  const stopLoopRef = useRef<boolean>(false);

  useEffect(() => {
    return () => { stopLoopRef.current = true; };
  }, []);

  const onContextCreate = async (gl: any) => {
    glRef.current = gl;
  // AR deshabilitado: dependencia expo-three-ar incompatible con versión de three.

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.01, 1000);
    camera.position.z = 0.5;

    const renderer = new Renderer({ gl });
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
  renderer.setClearColor('#000000', 1); // opaque since no camera feed

    // Lighting
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 1, 2).normalize();
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));

    // Test cube
    const cubeGeom = new THREE.BoxGeometry(0.05, 0.05, 0.05);
    const cubeMat = new THREE.MeshStandardMaterial({ color: 0x00ff80 });
    const cube = new THREE.Mesh(cubeGeom, cubeMat);
    cube.position.set(0, 0, -0.3);
    scene.add(cube);

    // Optional: Try to load a model (replace with actual GLB path if needed)
    // Example placeholder using odontologia if present
    try {
      const mod = require('../assets/odontologia.glb');
      const asset = Asset.fromModule(mod);
      if (!asset.localUri) await asset.downloadAsync();
      const uri = asset.localUri || asset.uri;
      const loader = new GLTFLoader();
      loader.load(uri, (gltf: any) => {
        gltf.scene.position.set(0, -0.1, -0.4);
        gltf.scene.scale.set(0.1,0.1,0.1);
        scene.add(gltf.scene);
      }, undefined, (err: any) => console.warn('AR GLB load error', err?.message || err));
    } catch (e) {
  console.log('No model loaded (optional):', (e as any)?.message);
    }

    const renderLoop = () => {
      if (stopLoopRef.current) return;
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.02;
      renderer.render(scene, camera);
      gl.endFrameEXP();
      requestAnimationFrame(renderLoop);
    };
    renderLoop();
  };

  return <GLView style={{ flex: 1 }} onContextCreate={onContextCreate} />;
};

