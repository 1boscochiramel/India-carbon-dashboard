"""
India Carbon Liability Model
Python library for carbon liability analysis
"""

import numpy as np
import pandas as pd
from dataclasses import dataclass
from typing import List, Dict, Optional

__version__ = "6.0.0"
__author__ = "Based on research by Bosco Chiramel"

# Pathway multipliers
PATHWAY_MULT = {
    "BAU": 1.44,
    "Moderate": 1.21,
    "Aggressive": 1.0,
    "Early Action": 0.92
}

# Refinery data
REFINERIES = [
    {"name": "Jamnagar DTA", "operator": "RIL", "type": "Private", "capacity": 33.0, "age": 25, "liability": 5.57, "risk": "A", "state": "Gujarat"},
    {"name": "Jamnagar SEZ", "operator": "RIL", "type": "Private", "capacity": 35.2, "age": 16, "liability": 4.92, "risk": "AAA", "state": "Gujarat"},
    {"name": "Paradip", "operator": "IOCL", "type": "PSU", "capacity": 15.0, "age": 8, "liability": 2.62, "risk": "AAA", "state": "Odisha"},
    {"name": "Kochi", "operator": "BPCL", "type": "PSU", "capacity": 15.5, "age": 58, "liability": 0.95, "risk": "BB", "state": "Kerala"},
    {"name": "Panipat", "operator": "IOCL", "type": "PSU", "capacity": 15.0, "age": 26, "liability": 0.88, "risk": "AAA", "state": "Haryana"},
    {"name": "Mangalore", "operator": "MRPL", "type": "PSU", "capacity": 15.0, "age": 36, "liability": 0.85, "risk": "BBB", "state": "Karnataka"},
    {"name": "Gujarat", "operator": "IOCL", "type": "PSU", "capacity": 13.7, "age": 59, "liability": 0.78, "risk": "BB", "state": "Gujarat"},
    {"name": "BPCL Mumbai", "operator": "BPCL", "type": "PSU", "capacity": 12.0, "age": 69, "liability": 0.72, "risk": "B", "state": "Maharashtra"},
    {"name": "Chennai", "operator": "CPCL", "type": "PSU", "capacity": 10.5, "age": 55, "liability": 0.65, "risk": "BB", "state": "Tamil Nadu"},
    {"name": "Visakhapatnam", "operator": "HPCL", "type": "PSU", "capacity": 8.33, "age": 67, "liability": 0.58, "risk": "B", "state": "AP"},
    {"name": "HPCL Mumbai", "operator": "HPCL", "type": "PSU", "capacity": 7.5, "age": 70, "liability": 0.52, "risk": "B", "state": "Maharashtra"},
    {"name": "Mathura", "operator": "IOCL", "type": "PSU", "capacity": 8.0, "age": 42, "liability": 0.48, "risk": "BB", "state": "UP"},
    {"name": "Haldia", "operator": "IOCL", "type": "PSU", "capacity": 8.0, "age": 50, "liability": 0.46, "risk": "BB", "state": "WB"},
    {"name": "Bina", "operator": "BPCL", "type": "PSU", "capacity": 7.8, "age": 13, "liability": 0.44, "risk": "AAA", "state": "MP"},
    {"name": "Bathinda", "operator": "HMEL", "type": "PSU", "capacity": 11.3, "age": 14, "liability": 0.42, "risk": "AAA", "state": "Punjab"},
    {"name": "Numaligarh", "operator": "NRL", "type": "PSU", "capacity": 3.0, "age": 25, "liability": 0.22, "risk": "BBB", "state": "Assam"},
    {"name": "Vadodara", "operator": "IOCL", "type": "PSU", "capacity": 4.5, "age": 62, "liability": 0.18, "risk": "B", "state": "Gujarat"},
    {"name": "Barauni", "operator": "IOCL", "type": "PSU", "capacity": 6.0, "age": 60, "liability": 0.16, "risk": "B", "state": "Bihar"},
    {"name": "Guwahati", "operator": "IOCL", "type": "PSU", "capacity": 1.0, "age": 62, "liability": 0.08, "risk": "B", "state": "Assam"},
    {"name": "Digboi", "operator": "IOCL", "type": "PSU", "capacity": 0.65, "age": 123, "liability": 0.01, "risk": "B", "state": "Assam"},
]

@dataclass
class Scenario:
    """Carbon scenario parameters"""
    carbon_price: float = 50.0
    discount_rate: float = 10.0
    pathway: str = "Aggressive"
    
    def __post_init__(self):
        if self.pathway not in PATHWAY_MULT:
            raise ValueError(f"Invalid pathway. Choose from: {list(PATHWAY_MULT.keys())}")

@dataclass 
class MonteCarloResult:
    """Monte Carlo simulation results"""
    p5: float
    p25: float
    p50: float
    p75: float
    p95: float
    mean: float
    std: float
    simulations: np.ndarray

class CarbonModel:
    """
    India Carbon Liability Model
    
    Example usage:
        model = CarbonModel()
        liability = model.calculate_liability(50, 10, 'Aggressive')
        mc = model.monte_carlo(1000)
    """
    
    BASE_LIABILITY = 13.1  # $B at $50/t, 10% rate, Aggressive pathway
    
    def __init__(self):
        self.refineries = pd.DataFrame(REFINERIES)
        self.scenario = Scenario()
    
    def set_scenario(self, carbon_price: float = 50, discount_rate: float = 10, 
                     pathway: str = "Aggressive") -> 'CarbonModel':
        """Set scenario parameters"""
        self.scenario = Scenario(carbon_price, discount_rate, pathway)
        return self
    
    def calculate_liability(self, carbon_price: Optional[float] = None,
                           discount_rate: Optional[float] = None,
                           pathway: Optional[str] = None) -> float:
        """
        Calculate total carbon liability
        
        Args:
            carbon_price: $/tonne CO2 (default: scenario value)
            discount_rate: % (default: scenario value)
            pathway: BAU|Moderate|Aggressive|Early Action
            
        Returns:
            Total liability in $B
        """
        price = carbon_price or self.scenario.carbon_price
        rate = discount_rate or self.scenario.discount_rate
        path = pathway or self.scenario.pathway
        
        mult = PATHWAY_MULT.get(path, 1.0)
        return round(self.BASE_LIABILITY * (price / 50) * mult * (10 / rate), 1)
    
    def monte_carlo(self, n_simulations: int = 1000,
                   price_variance: float = 0.6,
                   emission_variance: float = 0.4) -> MonteCarloResult:
        """
        Run Monte Carlo simulation
        
        Args:
            n_simulations: Number of iterations
            price_variance: Price uncertainty (±%)
            emission_variance: Emission uncertainty (±%)
            
        Returns:
            MonteCarloResult with percentiles
        """
        results = []
        for _ in range(n_simulations):
            p_var = 1 + (np.random.random() - 0.5) * price_variance
            e_var = 1 + (np.random.random() - 0.5) * emission_variance
            
            liability = (self.BASE_LIABILITY * 
                        (self.scenario.carbon_price / 50) * 
                        p_var * 
                        PATHWAY_MULT[self.scenario.pathway] * 
                        e_var * 
                        (10 / self.scenario.discount_rate))
            results.append(liability)
        
        results = np.array(sorted(results))
        
        return MonteCarloResult(
            p5=round(np.percentile(results, 5), 1),
            p25=round(np.percentile(results, 25), 1),
            p50=round(np.percentile(results, 50), 1),
            p75=round(np.percentile(results, 75), 1),
            p95=round(np.percentile(results, 95), 1),
            mean=round(np.mean(results), 1),
            std=round(np.std(results), 1),
            simulations=results
        )
    
    def sensitivity_analysis(self, factor: str = "carbon_price", 
                            range_pct: float = 30) -> pd.DataFrame:
        """
        Sensitivity analysis for a given factor
        
        Args:
            factor: carbon_price|discount_rate
            range_pct: Variation range (±%)
            
        Returns:
            DataFrame with sensitivity results
        """
        base_value = getattr(self.scenario, factor)
        results = []
        
        for pct in np.linspace(-range_pct, range_pct, 7):
            new_value = base_value * (1 + pct/100)
            
            if factor == "carbon_price":
                liability = self.calculate_liability(carbon_price=new_value)
            else:
                liability = self.calculate_liability(discount_rate=new_value)
            
            results.append({
                'change_pct': pct,
                factor: new_value,
                'liability': liability
            })
        
        return pd.DataFrame(results)
    
    def generate_insights(self) -> List[Dict]:
        """
        Generate AI-style insights based on current scenario
        
        Returns:
            List of insight dictionaries
        """
        liability = self.calculate_liability()
        insights = []
        
        # Price insights
        if self.scenario.carbon_price < 30:
            insights.append({
                "type": "warning",
                "icon": "⚠️",
                "title": "Carbon Price Below International Benchmarks",
                "detail": f"${self.scenario.carbon_price}/t is 56% below EU ETS",
                "action": "Consider $30-50/t minimum for CBAM compatibility"
            })
        elif self.scenario.carbon_price > 80:
            insights.append({
                "type": "success",
                "icon": "✅",
                "title": "Strong Carbon Price Signal",
                "detail": f"${self.scenario.carbon_price}/t enables 15-20% IRR",
                "action": "Fast-track CCUS and Green Hydrogen"
            })
        
        # Pathway insights
        if self.scenario.pathway == "BAU":
            insights.append({
                "type": "critical",
                "icon": "🚨",
                "title": "BAU Risks Stranded Assets",
                "detail": "$63.7B stranding risk without action",
                "action": "Review 7 facilities over 60 years"
            })
        elif self.scenario.pathway == "Early Action":
            insights.append({
                "type": "success",
                "icon": "✅",
                "title": "Early Action Saves $6.8B",
                "detail": "Front-loaded investment optimal",
                "action": "Accelerate 2026-2030 investments"
            })
        
        # Structural insight
        insights.append({
            "type": "info",
            "icon": "💡",
            "title": "PSU Age Gap: 28 Years",
            "detail": "PSU avg 49y vs Private 21y",
            "action": "Prioritize PSU modernization"
        })
        
        # Elevated liability
        if liability > 15:
            insights.append({
                "type": "critical",
                "icon": "🚨",
                "title": "Elevated Liability",
                "detail": f"${liability}B exceeds base by {round((liability/13.1-1)*100)}%",
                "action": "Accelerate ETS implementation"
            })
        
        return insights
    
    def get_refinery_data(self, filter_type: Optional[str] = None,
                         filter_risk: Optional[str] = None) -> pd.DataFrame:
        """
        Get refinery data with optional filters
        
        Args:
            filter_type: PSU|Private
            filter_risk: AAA|A|BBB|BB|B
            
        Returns:
            Filtered DataFrame
        """
        df = self.refineries.copy()
        if filter_type:
            df = df[df['type'] == filter_type]
        if filter_risk:
            df = df[df['risk'] == filter_risk]
        return df
    
    def summary(self) -> Dict:
        """Get scenario summary"""
        liability = self.calculate_liability()
        mc = self.monte_carlo()
        
        return {
            "scenario": {
                "carbon_price": self.scenario.carbon_price,
                "discount_rate": self.scenario.discount_rate,
                "pathway": self.scenario.pathway
            },
            "liability": liability,
            "monte_carlo": {
                "p5": mc.p5,
                "p50": mc.p50,
                "p95": mc.p95,
                "mean": mc.mean
            },
            "refineries": {
                "total": len(self.refineries),
                "psu": len(self.refineries[self.refineries['type'] == 'PSU']),
                "private": len(self.refineries[self.refineries['type'] == 'Private']),
                "high_risk": len(self.refineries[self.refineries['risk'].isin(['B', 'BB'])])
            }
        }
    
    def __repr__(self):
        return f"CarbonModel(price=${self.scenario.carbon_price}/t, rate={self.scenario.discount_rate}%, pathway={self.scenario.pathway})"


# Convenience functions
def quick_estimate(carbon_price: float = 50, discount_rate: float = 10, 
                   pathway: str = "Aggressive") -> float:
    """Quick liability estimate"""
    return CarbonModel().calculate_liability(carbon_price, discount_rate, pathway)

def quick_monte_carlo(carbon_price: float = 50, discount_rate: float = 10,
                     pathway: str = "Aggressive", n: int = 1000) -> Dict:
    """Quick Monte Carlo"""
    model = CarbonModel()
    model.set_scenario(carbon_price, discount_rate, pathway)
    mc = model.monte_carlo(n)
    return {"p5": mc.p5, "p50": mc.p50, "p95": mc.p95}


if __name__ == "__main__":
    # Demo
    print("🇮🇳 India Carbon Liability Model")
    print("=" * 40)
    
    model = CarbonModel()
    model.set_scenario(carbon_price=75, discount_rate=8, pathway="Moderate")
    
    print(f"\nScenario: {model}")
    print(f"Liability: ${model.calculate_liability()}B")
    
    mc = model.monte_carlo()
    print(f"Monte Carlo 90% CI: ${mc.p5}B - ${mc.p95}B")
    
    print("\n📊 Insights:")
    for insight in model.generate_insights():
        print(f"  {insight['icon']} {insight['title']}")
    
    print("\n📋 Summary:")
    summary = model.summary()
    print(f"  Total refineries: {summary['refineries']['total']}")
    print(f"  High-risk facilities: {summary['refineries']['high_risk']}")
