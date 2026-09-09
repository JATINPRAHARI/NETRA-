import { useEffect, useRef, useCallback, useState } from 'react';
import type { Entity, Relationship } from '@/lib/types';

const TYPE_COLORS: Record<string, string> = {
  FIR: '#4cd7f6', District: '#a855f7', PoliceUnit: '#3b82f6',
  CrimeGroup: '#ef4444', CrimeHead: '#f97316', Location: '#22c55e',
  InvestigatingOfficer: '#eab308', ActSection: '#ec4899',
};

const FORCE_STRENGTH = 600;
const SPRING_STRENGTH = 0.006;
const SPRING_LENGTH = 140;
const CENTER_STRENGTH = 0.012;
const DAMPING = 0.82;
const REPULSION_DISTANCE = 200;

type Node = { id: string; x: number; y: number; entity: Entity; vx: number; vy: number; fx: number; fy: number };
type Edge = { from: Node; to: Node; rel: Relationship };

export default function MiniGraph({ entities, relationships, height = 320 }: { entities: Entity[]; relationships: Relationship[]; height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const edgesRef = useRef<Edge[]>([]);
  const animRef = useRef<number>(0);
  const dragRef = useRef<{ node: Node | null; offsetX: number; offsetY: number; dragging: boolean }>({ node: null, offsetX: 0, offsetY: 0, dragging: false });
  const panRef = useRef({ x: 0, y: 0, dragging: false, lastX: 0, lastY: 0 });
  const zoomRef = useRef(1);
  const sizeRef = useRef({ w: 0, h: 0 });
  const prevDragRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const velocityRef = useRef<{ vx: number; vy: number }>({ vx: 0, vy: 0 });

  const syncCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const w = container.clientWidth;
    const h = height;
    const dpr = devicePixelRatio;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    sizeRef.current = { w, h };
  }, [height]);

  const initGraph = useCallback(() => {
    syncCanvasSize();
    const { w, h } = sizeRef.current;
    if (w === 0 || h === 0) return;
    const cx = w / 2, cy = h / 2;
    const nodes: Node[] = entities.map((e, i) => {
      const angle = (i / entities.length) * Math.PI * 2;
      const radius = e.type === 'FIR' ? 0 : Math.min(w, h) * 0.3;
      return { id: e.id, x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius, entity: e, vx: 0, vy: 0, fx: 0, fy: 0 };
    });
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    const edges: Edge[] = relationships.map(r => {
      const from = nodeMap.get(r.source_id);
      const to = nodeMap.get(r.target_id);
      return from && to ? { from, to, rel: r } : null;
    }).filter((e): e is Edge => e !== null);
    nodesRef.current = nodes;
    edgesRef.current = edges;
  }, [entities, relationships, syncCanvasSize]);

  const applyForces = useCallback(() => {
    const { w, h } = sizeRef.current;
    if (w === 0) return;
    const cx = w / 2, cy = h / 2;
    const nodes = nodesRef.current;
    for (let i = 0; i < nodes.length; i++) { nodes[i].fx = 0; nodes[i].fy = 0; }
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      a.fx += -(a.x - cx) * CENTER_STRENGTH;
      a.fy += -(a.y - cy) * CENTER_STRENGTH;
    }
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        let dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < 1) dist = 1;
        if (dist < REPULSION_DISTANCE) {
          const force = FORCE_STRENGTH / (dist * dist);
          const fx = ((a.x - b.x) / dist) * force;
          const fy = ((a.y - b.y) / dist) * force;
          a.fx += fx; a.fy += fy; b.fx -= fx; b.fy -= fy;
        }
      }
    }
    for (const edge of edgesRef.current) {
      const dx = edge.to.x - edge.from.x, dy = edge.to.y - edge.from.y;
      const dist = Math.hypot(dx, dy);
      const displacement = dist - SPRING_LENGTH;
      const force = displacement * SPRING_STRENGTH;
      const fx = (dx / (dist || 1)) * force;
      const fy = (dy / (dist || 1)) * force;
      edge.from.fx += fx; edge.from.fy += fy; edge.to.fx -= fx; edge.to.fy -= fy;
    }
    for (const node of nodes) {
      if (dragRef.current.node?.id === node.id) continue;
      node.vx = (node.vx + node.fx) * DAMPING;
      node.vy = (node.vy + node.fy) * DAMPING;
      node.x += node.vx; node.y += node.vy;
    }
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = devicePixelRatio;
    const w = canvas.width / dpr, h = canvas.height / dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(panRef.current.x, panRef.current.y);
    ctx.scale(zoomRef.current, zoomRef.current);

    for (const edge of edgesRef.current) {
      const gradient = ctx.createLinearGradient(edge.from.x, edge.from.y, edge.to.x, edge.to.y);
      gradient.addColorStop(0, 'rgba(76, 215, 246, 0.15)');
      gradient.addColorStop(1, 'rgba(76, 215, 246, 0.08)');
      ctx.beginPath();
      ctx.moveTo(edge.from.x, edge.from.y);
      ctx.lineTo(edge.to.x, edge.to.y);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1;
      ctx.stroke();
      const angle = Math.atan2(edge.to.y - edge.from.y, edge.to.x - edge.from.x);
      const midX = (edge.from.x + edge.to.x) / 2, midY = (edge.from.y + edge.to.y) / 2;
      ctx.save();
      ctx.translate(midX, midY);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(5, 0); ctx.lineTo(-3, -3); ctx.lineTo(-3, 3); ctx.closePath();
      ctx.fillStyle = 'rgba(76, 215, 246, 0.3)';
      ctx.fill();
      ctx.restore();
    }

    for (const node of nodesRef.current) {
      const color = TYPE_COLORS[node.entity.type] || '#6b7280';
      const isFir = node.entity.type === 'FIR';
      const radius = isFir ? 14 : 10;

      if (isFir) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + 6, 0, Math.PI * 2);
        const glow = ctx.createRadialGradient(node.x, node.y, radius, node.x, node.y, radius + 6);
        glow.addColorStop(0, color + '15');
        glow.addColorStop(1, color + '00');
        ctx.fillStyle = glow;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      const bg = ctx.createRadialGradient(node.x - 2, node.y - 2, 0, node.x, node.y, radius);
      bg.addColorStop(0, '#141c27');
      bg.addColorStop(1, '#0d141d');
      ctx.fillStyle = bg;
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(node.x, node.y, isFir ? 3.5 : 2.5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      ctx.fillStyle = '#e2e8f0';
      ctx.font = '9px Inter, sans-serif';
      ctx.textAlign = 'center';
      const label = node.entity.name.length > 18 ? node.entity.name.slice(0, 16) + '...' : node.entity.name;
      ctx.fillText(label, node.x, node.y + radius + 12);

      ctx.fillStyle = color;
      ctx.font = '7px Inter, sans-serif';
      ctx.fillText(node.entity.type, node.x, node.y + radius + 20);
    }

    ctx.restore();
  }, []);

  useEffect(() => { initGraph(); }, [initGraph]);
  useEffect(() => {
    let animFrame: number;
    let forceFrame: number;
    const render = () => {
      applyForces();
      draw();
      animFrame = requestAnimationFrame(render);
    };
    animFrame = requestAnimationFrame(render);
    return () => { cancelAnimationFrame(animFrame); cancelAnimationFrame(forceFrame); };
  }, [draw, applyForces]);
  useEffect(() => { const onResize = () => syncCanvasSize(); window.addEventListener('resize', onResize); return () => window.removeEventListener('resize', onResize); }, [syncCanvasSize]);

  const getNodeAt = (x: number, y: number): Node | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const mx = (x - rect.left - panRef.current.x) / zoomRef.current;
    const my = (y - rect.top - panRef.current.y) / zoomRef.current;
    for (const node of nodesRef.current) { if (Math.hypot(mx - node.x, my - node.y) < 16) return node; }
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const node = getNodeAt(e.clientX, e.clientY);
    if (node) {
      const canvas = canvasRef.current; if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left - panRef.current.x) / zoomRef.current;
      const my = (e.clientY - rect.top - panRef.current.y) / zoomRef.current;
      dragRef.current = { node, offsetX: mx - node.x, offsetY: my - node.y, dragging: true };
      prevDragRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
      velocityRef.current = { vx: 0, vy: 0 };
    } else {
      panRef.current = { ...panRef.current, dragging: true, lastX: e.clientX, lastY: e.clientY };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragRef.current.dragging && dragRef.current.node) {
      const node = dragRef.current.node;
      const canvas = canvasRef.current; if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      node.x = (e.clientX - rect.left - panRef.current.x) / zoomRef.current - dragRef.current.offsetX;
      node.y = (e.clientY - rect.top - panRef.current.y) / zoomRef.current - dragRef.current.offsetY;
      node.vx = 0; node.vy = 0;
      if (prevDragRef.current) {
        const dt = Date.now() - prevDragRef.current.time;
        if (dt > 0) {
          const canvasX = (e.clientX - rect.left - panRef.current.x) / zoomRef.current;
          const canvasY = (e.clientY - rect.top - panRef.current.y) / zoomRef.current;
          const prevCanvasX = (prevDragRef.current.x - rect.left - panRef.current.x) / zoomRef.current;
          const prevCanvasY = (prevDragRef.current.y - rect.top - panRef.current.y) / zoomRef.current;
          velocityRef.current = { vx: ((canvasX - prevCanvasX) / dt) * 16, vy: ((canvasY - prevCanvasY) / dt) * 16 };
        }
      }
      prevDragRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
    } else if (panRef.current.dragging) {
      panRef.current.x += e.clientX - panRef.current.lastX;
      panRef.current.y += e.clientY - panRef.current.lastY;
      panRef.current.lastX = e.clientX;
      panRef.current.lastY = e.clientY;
    }
  };

  const handleMouseUp = () => {
    if (dragRef.current.node) {
      const node = dragRef.current.node;
      node.vx = velocityRef.current.vx * 0.5;
      node.vy = velocityRef.current.vy * 0.5;
    }
    dragRef.current = { node: null, offsetX: 0, offsetY: 0, dragging: false };
    panRef.current.dragging = false;
    prevDragRef.current = null;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current; if (!canvas) return;
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.3, Math.min(3, zoomRef.current * delta));
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    panRef.current.x = mx - (mx - panRef.current.x) * (newZoom / zoomRef.current);
    panRef.current.y = my - (my - panRef.current.y) * (newZoom / zoomRef.current);
    zoomRef.current = newZoom;
  };

  return (
    <div ref={containerRef} className="w-full" style={{ height, background: 'radial-gradient(circle at 50% 50%, rgba(76, 215, 246, 0.03), transparent 70%)' }}>
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />
    </div>
  );
}
