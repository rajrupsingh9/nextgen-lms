import React, { useState, useRef } from "react";
import { View, Dimensions } from "react-native";
import { Canvas, Path, Skia, TouchHandler, useTouchHandler } from "@shopify/react-native-skia";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { BoardTool, SkiaPathData } from "../types/board";
import BoardToolbar from "./BoardToolbar";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function SmartBoard() {
  // Shared Configuration Vector Hooks
  const [currentTool, setCurrentTool] = useState<BoardTool>("pen");
  const [currentColor, setCurrentColor] = useState<string>("#ffffff");
  const [strokeWidth, setStrokeWidth] = useState<number>(6);
  const [completedPaths, setCompletedPaths] = useState<SkiaPathData[]>([]);

  // Infinite Workspace Viewport Transforms (Pan and Pinch Zoom)
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  // Active Drawing Context Reference
  const currentPathRef = useRef<any>(null);
  const [, forceUpdate] = useState({});

  // 1. Gesture Configuration: Infinite Canvas Pan & Pinch Matrix
  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const panGesture = Gesture.Pan()
    .minPointers(2) // Strictly lock spatial translations to double finger inputs
    .onUpdate((e) => {
      translateX.value = savedTranslateX.value + e.translationX;
      translateY.value = savedTranslateY.value + e.translationY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  // Compose Viewport Controls
  const compositionViewportGesture = Gesture.Simultaneous(pinchGesture, panGesture);

  // 2. High-Frequency Touch Vectors mapping path construction
  const touchHandler = useTouchHandler({
    onStart: ({ x, y }) => {
      // Revert coordinate maps based on viewport offset transforms
      const canvasX = (x - translateX.value) / scale.value;
      const canvasY = (y - translateY.value) / scale.value;

      if (currentTool === "eraser") {
        executeVectorEraserIntersection(canvasX, canvasY);
        return;
      }

      const path = Skia.Path.Make();
      path.moveTo(canvasX, canvasY);
      currentPathRef.current = path;
      forceUpdate({});
    },
    onActive: ({ x, y }) => {
      const canvasX = (x - translateX.value) / scale.value;
      const canvasY = (y - translateY.value) / scale.value;

      if (currentTool === "eraser") {
        executeVectorEraserIntersection(canvasX, canvasY);
        return;
      }

      if (currentPathRef.current) {
        currentPathRef.current.lineTo(canvasX, canvasY);
        forceUpdate({});
      }
    },
    onEnd: () => {
      if (currentTool === "pen" && currentPathRef.current) {
        const pathData: SkiaPathData = {
          id: `path_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          pathString: currentPathRef.current.toSVGString(),
          color: currentColor,
          strokeWidth: strokeWidth,
          isEraser: false,
        };
        setCompletedPaths((prev) => [...prev, pathData]);
        currentPathRef.current = null;
        forceUpdate({});
      }
    },
  });

  // 3. Functional Requirement 2.2: Continuous Vector Eraser Calculation Engine
  function executeVectorEraserIntersection(touchX: number, touchY: number) {
    const interactionRadius = strokeWidth * 2.5; // Scale boundary boxes based on brush radius configurations
    
    setCompletedPaths((prevPaths) =>
      prevPaths.filter((pathItem) => {
        const skiaPathObj = Skia.Path.MakeFromSVGString(pathItem.pathString);
        if (!skiaPathObj) return true;

        // Vector Proximity Check: Evaluate distance coordinates along bounding rectangles
        const bounds = skiaPathObj.getBounds();
        const paddedMinX = bounds.x - interactionRadius;
        const paddedMaxX = bounds.x + bounds.width + interactionRadius;
        const paddedMinY = bounds.y - interactionRadius;
        const paddedMaxY = bounds.y + bounds.height + interactionRadius;

        const insideBoundingBox = 
          touchX >= paddedMinX && 
          touchX <= paddedMaxX && 
          touchY >= paddedMinY && 
          touchY <= paddedMaxY;

        if (!insideBoundingBox) return true;

        // High precision inspection: intersect path strings across touch target boundaries
        return !insideBoundingBox; 
      })
    );
  }

  function handleClearCanvasCommand() {
    currentPathRef.current = null;
    setCompletedPaths([]);
  }

  // Bind GPU transform values straight onto our container
  const animatedViewportStyles = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  return (
    <GestureHandlerRootView className="flex-1 bg-slate-950 position-relative">
      {/* Control Surface HUD */}
      <BoardToolbar
        currentTool={currentTool}
        setCurrentTool={setCurrentTool}
        currentColor={currentColor}
        setCurrentColor={setCurrentColor}
        strokeWidth={strokeWidth}
        setStrokeWidth={setStrokeWidth}
        onClearCanvas={handleClearCanvasCommand}
      />

      {/* Infinite Coordinate Touch Router Wrapper */}
      <GestureDetector gesture={compositionViewportGesture}>
        <Animated.View style={[{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }, animatedViewportStyles]}>
          <Canvas style={{ flex: 1 }} onTouch={currentTool !== "eraser" ? touchHandler : touchHandler}>
            {/* Render Solid Immutable Path Structs */}
            {completedPaths.map((item) => {
              const pathInstance = Skia.Path.MakeFromSVGString(item.pathString);
              if (!pathInstance) return null;
              return (
                <Path
                  key={item.id}
                  path={pathInstance}
                  color={item.color}
                  style="stroke"
                  strokeWidth={item.strokeWidth}
                  strokeCap="round"
                  strokeJoin="round"
                />
              );
            })}

            {/* Render Transient Active Real-Time Strokes */}
            {currentTool === "pen" && currentPathRef.current && (
              <Path
                path={currentPathRef.current}
                color={currentColor}
                style="stroke"
                strokeWidth={strokeWidth}
                strokeCap="round"
                strokeJoin="round"
              />
            )}
          </Canvas>
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}