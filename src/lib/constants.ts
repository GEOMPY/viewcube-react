export const VC_OFFSET = 1.15;
export const VC_FACE_W = 1.58;
export const VC_EDGE_LENGTH = 1.58;
export const VC_EDGE_W = 0.3;
export const VC_DEPTH = 0.26;
export const VC_CORNER_R = 0.3;

export const VC_COL_EDGE = 0xcccccc;
export const VC_COL_CORNER = 0x999999;
export const VC_COL_HOVER = 0x00c8ff;

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
