import {
  useRef,
  useEffect,
  useState,
  useMemo,
  useId,
  FC,
  PointerEvent,
  useCallback
} from "react";

interface CurvedLoopProps {
  valuePropositionStack: {
    benefit: string;
    methodology: string;
  }[];
  speed?: number;
  className?: string;
  curveAmount?: number;
  direction?: "left" | "right";
  interactive?: boolean;
  isPaused?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const CurvedLoop: FC<CurvedLoopProps> = ({
  valuePropositionStack = [],
  speed = 2,
  className = "",
  curveAmount = 200,
  direction = "left",
  interactive = true,
  isPaused = false,
  onMouseEnter,
  onMouseLeave,
}) => {
  // Create formatted text items for the loop
  const formattedItems = useMemo(() => {
    if (!valuePropositionStack || valuePropositionStack.length === 0) return [];
    
    // Create benefit -> methodology pairs for each pillar
    return valuePropositionStack.map((item, index) => ({
      id: index,
      benefit: item.benefit,
      methodology: item.methodology
    }));
  }, [valuePropositionStack]);

  const measureRef = useRef<SVGTextElement | null>(null);
  const textPathRef = useRef<SVGTextPathElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const [spacing, setSpacing] = useState(0);
  const [offset, setOffset] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const uid = useId();
  const pathId = `curve-${uid}`;
  const pathD = `M-100,40 Q500,${40 + curveAmount} 1540,40`;

  const dragRef = useRef(false);
  const lastXRef = useRef(0);
  const dirRef = useRef<"left" | "right">(direction);
  const velRef = useRef(0);

  const textLength = spacing;
  const ready = spacing > 0;

  // Build the display text with benefit -> methodology format for all pillars
  const buildLoopText = useCallback(() => {
    if (formattedItems.length === 0) return "";
    
    // Create the benefit -> methodology text for each pillar
    const loopParts = formattedItems.map(item =>
      `${item.benefit} -> ${item.methodology}`
    );
    
    // Join with separators and add spacing for seamless looping
    return loopParts.join(" • ") + " • ";
  }, [formattedItems]);

  const loopText = useMemo(buildLoopText, [buildLoopText]);

  // Create repeated text for the marquee effect
  const totalText = useMemo(() => {
    if (!ready || !loopText) return "";
    const repetitions = Math.ceil(1800 / (textLength || 100)) + 2;
    return Array(repetitions).fill(loopText).join("");
  }, [loopText, ready, textLength]);

  useEffect(() => {
    if (measureRef.current)
      setSpacing(measureRef.current.getComputedTextLength());
  }, [loopText, className]);

  useEffect(() => {
    if (!spacing) return;
    if (textPathRef.current) {
      const initial = -spacing;
      textPathRef.current.setAttribute("startOffset", initial + "px");
      setOffset(initial);
    }
  }, [spacing]);

  useEffect(() => {
    if (!spacing || !ready || isPaused || isHovering) return;
    let frame = 0;
    const step = () => {
      if (!dragRef.current && textPathRef.current) {
        const delta = dirRef.current === "right" ? speed : -speed;
        const currentOffset = parseFloat(
          textPathRef.current.getAttribute("startOffset") || "0",
        );
        let newOffset = currentOffset + delta;
        const wrapPoint = spacing;
        if (newOffset <= -wrapPoint) newOffset += wrapPoint;
        if (newOffset > 0) newOffset -= wrapPoint;
        textPathRef.current.setAttribute("startOffset", newOffset + "px");
        setOffset(newOffset);
      }
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [spacing, speed, ready, isPaused, isHovering]);

  const onPointerDown = useCallback((e: PointerEvent) => {
    if (!interactive) return;
    dragRef.current = true;
    lastXRef.current = e.clientX;
    velRef.current = 0;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [interactive]);

  const onPointerMove = useCallback((e: PointerEvent) => {
    if (!interactive || !dragRef.current || !textPathRef.current) return;
    const dx = e.clientX - lastXRef.current;
    lastXRef.current = e.clientX;
    velRef.current = dx;
    const currentOffset = parseFloat(
      textPathRef.current.getAttribute("startOffset") || "0",
    );
    let newOffset = currentOffset + dx;
    const wrapPoint = spacing;
    if (newOffset <= -wrapPoint) newOffset += wrapPoint;
    if (newOffset > 0) newOffset -= wrapPoint;
    textPathRef.current.setAttribute("startOffset", newOffset + "px");
    setOffset(newOffset);
  }, [interactive, spacing]);

  const endDrag = useCallback(() => {
    if (!interactive) return;
    dragRef.current = false;
    dirRef.current = velRef.current > 0 ? "right" : "left";
  }, [interactive]);

  const cursorStyle = interactive
    ? dragRef.current
      ? "grabbing"
      : "grab"
    : "auto";

  const handlePointerEnter = useCallback(() => {
    if (interactive) {
      setIsHovering(true);
      onMouseEnter?.();
    }
  }, [interactive, onMouseEnter]);

  const handlePointerLeave = useCallback(() => {
    if (interactive) {
      setIsHovering(false);
      endDrag();
      onMouseLeave?.();
    }
  }, [interactive, endDrag, onMouseLeave]);

  return (
    <div
      className="w-full"
      style={{
        visibility: ready ? "visible" : "hidden",
        cursor: cursorStyle,
        pointerEvents: "auto",
        position: "relative",
        zIndex: 20
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <svg
        className="select-none w-full overflow-visible block aspect-[100/12] text-[3rem] font-bold uppercase leading-none"
        viewBox="0 0 1440 120"
      >
        <text
          ref={measureRef}
          xmlSpace="preserve"
          style={{ visibility: "hidden", opacity: 0, pointerEvents: "none" }}
        >
          {formattedItems.map(item => `${item.benefit} -> ${item.methodology}`).join(" • ")}
        </text>
        <defs>
          <path
            ref={pathRef}
            id={pathId}
            d={pathD}
            fill="none"
            stroke="transparent"
          />
        </defs>
        {ready && (
          <text 
            xmlSpace="preserve" 
            className={`fill-white ${className ?? ""}`}
            style={{ pointerEvents: "none" }}
          >
            <textPath
              ref={textPathRef}
              href={`#${pathId}`}
              startOffset={offset + "px"}
              xmlSpace="preserve"
            >
              {totalText}
            </textPath>
          </text>
        )}
      </svg>
    </div>
  );
};

export default CurvedLoop;
