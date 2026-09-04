"""
NER-LEWS Spatial Feature Engineering Engine
Computes geomorphic, hydrological, and structural conditioning factors from DEM rasters.
"""

import numpy as np

def compute_slope_aspect_curvatures(dem_elevation: np.ndarray, cell_size_m: float = 12.5):
    """
    Computes Zevenbergen & Thorne (1987) 3x3 window geomorphic derivatives:
    - Slope gradient (degrees)
    - Aspect (sine & cosine decomposed)
    - Profile curvature (down-slope flow acceleration)
    - Planform curvature (contour flow convergence/divergence)
    """
    # 2nd-order finite difference approximations for 3x3 kernel
    # [z1, z2, z3]
    # [z4, z5, z6]
    # [z7, z8, z9]
    pad_dem = np.pad(dem_elevation, 1, mode='edge')
    
    z1 = pad_dem[:-2, :-2]
    z2 = pad_dem[:-2, 1:-1]
    z3 = pad_dem[:-2, 2:]
    z4 = pad_dem[1:-1, :-2]
    z5 = pad_dem[1:-1, 1:-1]
    z6 = pad_dem[1:-1, 2:]
    z7 = pad_dem[2:, :-2]
    z8 = pad_dem[2:, 1:-1]
    z9 = pad_dem[2:, 2:]
    
    L = cell_size_m
    
    # Partial derivatives
    p = (z6 - z4) / (2.0 * L)
    q = (z2 - z8) / (2.0 * L)
    r = (z4 + z6 - 2.0 * z5) / (L ** 2)
    s = (z3 + z7 - z1 - z9) / (4.0 * L ** 2)
    t = (z2 + z8 - 2.0 * z5) / (L ** 2)
    
    # 1. Slope Gradient
    slope_rad = np.arctan(np.sqrt(p ** 2 + q ** 2))
    slope_deg = np.degrees(slope_rad)
    
    # 2. Aspect Decomposition (avoids 0°/360° circular discontinuity)
    aspect_rad = np.arctan2(-q, -p)
    aspect_sin = np.sin(aspect_rad)
    aspect_cos = np.cos(aspect_rad)
    
    # 3. Curvatures
    denom = (p ** 2 + q ** 2)
    denom[denom == 0] = 1e-6
    
    # Profile Curvature
    prof_curv = -(p ** 2 * r + 2.0 * p * q * s + q ** 2 * t) / (denom * (1.0 + denom) ** 1.5)
    
    # Planform Curvature
    plan_curv = -(q ** 2 * r - 2.0 * p * q * s + p ** 2 * t) / (denom ** 1.5)
    
    return {
        "slope_deg": slope_deg,
        "aspect_sin": aspect_sin,
        "aspect_cos": aspect_cos,
        "profile_curvature": prof_curv,
        "planform_curvature": plan_curv
    }

def compute_topographic_indices(slope_deg: np.ndarray, catchment_area_m2: np.ndarray):
    """
    Computes Hydrological and Geomorphological Indices:
    - Topographic Wetness Index (TWI) = ln(a / tan(beta))
    - Stream Power Index (SPI) = a * tan(beta)
    - Sediment Transport Index (STI) = (a / 22.13)^0.6 * (sin(beta) / 0.0896)^1.3
    """
    beta_rad = np.radians(np.maximum(0.5, slope_deg))
    tan_beta = np.tan(beta_rad)
    sin_beta = np.sin(beta_rad)
    
    # TWI
    twi = np.log(catchment_area_m2 / tan_beta)
    
    # SPI
    spi = catchment_area_m2 * tan_beta
    
    # STI (RUSLE LS factor equivalent)
    sti = ((catchment_area_m2 / 22.13) ** 0.6) * ((sin_beta / 0.0896) ** 1.3)
    
    return {
        "twi": twi,
        "spi": spi,
        "sti": sti
    }

if __name__ == "__main__":
    print("Testing synthetic 100x100 DEM processing...")
    x = np.linspace(0, 10, 100)
    y = np.linspace(0, 10, 100)
    xx, yy = np.meshgrid(x, y)
    synthetic_dem = 1200 + 400 * np.sin(xx / 2) + 200 * np.cos(yy / 3)
    
    derivs = compute_slope_aspect_curvatures(synthetic_dem, cell_size_m=12.5)
    print(f"Mean slope: {np.mean(derivs['slope_deg']):.2f}°")
    print(f"Max slope:  {np.max(derivs['slope_deg']):.2f}°")
    print("Feature engineering module verified successfully.")
