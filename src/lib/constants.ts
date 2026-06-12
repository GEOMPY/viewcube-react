export const VC_TOTAL = 1.0;
export const SLOT = VC_TOTAL / 3;

// change this value to change cube shape
export const VC_FACE_W = 0.75;
export const VC_EDGE_LENGTH = VC_FACE_W;
export const VC_EDGE_W = Math.SQRT2 * (0.5 - VC_FACE_W / 2);
export const VC_DEPTH = 0.10;
export const VC_CORNER_R = VC_EDGE_W * 0.5;

export const VC_COL_EDGE = 0xe4e4e7;
export const VC_COL_CORNER = 0xa1a1aa;
export const VC_COL_HOVER = 0x2563eb;
export const VC_OFFSET = 0.5 - VC_DEPTH / 2;

export const VC_LABELS: Record<string, string> = {
  "0,1,0": "TOP",
  "0,-1,0": "BOTTOM",
  "0,0,1": "FRONT",
  "0,0,-1": "BACK",
  "1,0,0": "RIGHT",
  "-1,0,0": "LEFT",
};

export const DRAG_THRESHOLD_PX = 5;
export const SNAP_LERP_DEFAULT = 0.12;
export const SNAP_EPS_DEFAULT = 0.001;
