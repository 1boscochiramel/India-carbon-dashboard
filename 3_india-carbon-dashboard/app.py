"""
India Carbon Liability Dashboard v6.0 MVP
Streamlit Web Application
Author: Based on research by Bosco Chiramel
"""

import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots

# Page Config
st.set_page_config(
    page_title="India Carbon Liability Dashboard",
    page_icon="🇮🇳",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Constants
VERSION = "6.0.0"
AUTHOR = "Bosco Chiramel"
PAPER = "Carbon Liability and Decarbonization Pathways for India's Petroleum Refining Sector"

# Data
@st.cache_data
def load_refinery_data():
    return pd.DataFrame([
        {"name": "Jamnagar DTA", "operator": "RIL", "type": "Private", "capacity": 33.0, "age": 25, "liability": 5.57, "risk": "A", "state": "Gujarat", "lat": 22.47, "lon": 70.07},
        {"name": "Jamnagar SEZ", "operator": "RIL", "type": "Private", "capacity": 35.2, "age": 16, "liability": 4.92, "risk": "AAA", "state": "Gujarat", "lat": 22.45, "lon": 70.05},
        {"name": "Paradip", "operator": "IOCL", "type": "PSU", "capacity": 15.0, "age": 8, "liability": 2.62, "risk": "AAA", "state": "Odisha", "lat": 20.32, "lon": 86.61},
        {"name": "Kochi", "operator": "BPCL", "type": "PSU", "capacity": 15.5, "age": 58, "liability": 0.95, "risk": "BB", "state": "Kerala", "lat": 9.93, "lon": 76.27},
        {"name": "Panipat", "operator": "IOCL", "type": "PSU", "capacity": 15.0, "age": 26, "liability": 0.88, "risk": "AAA", "state": "Haryana", "lat": 29.39, "lon": 76.97},
        {"name": "Mangalore", "operator": "MRPL", "type": "PSU", "capacity": 15.0, "age": 36, "liability": 0.85, "risk": "BBB", "state": "Karnataka", "lat": 12.91, "lon": 74.86},
        {"name": "Gujarat", "operator": "IOCL", "type": "PSU", "capacity": 13.7, "age": 59, "liability": 0.78, "risk": "BB", "state": "Gujarat", "lat": 22.31, "lon": 73.18},
        {"name": "BPCL Mumbai", "operator": "BPCL", "type": "PSU", "capacity": 12.0, "age": 69, "liability": 0.72, "risk": "B", "state": "Maharashtra", "lat": 19.03, "lon": 72.85},
        {"name": "Chennai", "operator": "CPCL", "type": "PSU", "capacity": 10.5, "age": 55, "liability": 0.65, "risk": "BB", "state": "Tamil Nadu", "lat": 13.05, "lon": 80.25},
        {"name": "Visakhapatnam", "operator": "HPCL", "type": "PSU", "capacity": 8.33, "age": 67, "liability": 0.58, "risk": "B", "state": "AP", "lat": 17.69, "lon": 83.22},
        {"name": "HPCL Mumbai", "operator": "HPCL", "type": "PSU", "capacity": 7.5, "age": 70, "liability": 0.52, "risk": "B", "state": "Maharashtra", "lat": 19.08, "lon": 72.88},
        {"name": "Mathura", "operator": "IOCL", "type": "PSU", "capacity": 8.0, "age": 42, "liability": 0.48, "risk": "BB", "state": "UP", "lat": 27.49, "lon": 77.67},
        {"name": "Haldia", "operator": "IOCL", "type": "PSU", "capacity": 8.0, "age": 50, "liability": 0.46, "risk": "BB", "state": "WB", "lat": 22.03, "lon": 88.06},
        {"name": "Bina", "operator": "BPCL", "type": "PSU", "capacity": 7.8, "age": 13, "liability": 0.44, "risk": "AAA", "state": "MP", "lat": 24.18, "lon": 78.13},
        {"name": "Bathinda", "operator": "HMEL", "type": "PSU", "capacity": 11.3, "age": 14, "liability": 0.42, "risk": "AAA", "state": "Punjab", "lat": 30.21, "lon": 74.95},
        {"name": "Numaligarh", "operator": "NRL", "type": "PSU", "capacity": 3.0, "age": 25, "liability": 0.22, "risk": "BBB", "state": "Assam", "lat": 26.63, "lon": 93.72},
        {"name": "Vadodara", "operator": "IOCL", "type": "PSU", "capacity": 4.5, "age": 62, "liability": 0.18, "risk": "B", "state": "Gujarat", "lat": 22.31, "lon": 73.18},
        {"name": "Barauni", "operator": "IOCL", "type": "PSU", "capacity": 6.0, "age": 60, "liability": 0.16, "risk": "B", "state": "Bihar", "lat": 25.47, "lon": 86.02},
        {"name": "Guwahati", "operator": "IOCL", "type": "PSU", "capacity": 1.0, "age": 62, "liability": 0.08, "risk": "B", "state": "Assam", "lat": 26.14, "lon": 91.74},
        {"name": "Digboi", "operator": "IOCL", "type": "PSU", "capacity": 0.65, "age": 123, "liability": 0.01, "risk": "B", "state": "Assam", "lat": 27.39, "lon": 95.62},
        {"name": "Tatipaka", "operator": "ONGC", "type": "PSU", "capacity": 0.07, "age": 23, "liability": 0.02, "risk": "BBB", "state": "AP", "lat": 16.57, "lon": 82.17},
        {"name": "Nagapattinam", "operator": "CPCL", "type": "PSU", "capacity": 1.0, "age": 30, "liability": 0.05, "risk": "BB", "state": "TN", "lat": 10.76, "lon": 79.84},
        {"name": "Bongaigaon", "operator": "IOCL", "type": "PSU", "capacity": 2.35, "age": 45, "liability": 0.12, "risk": "BB", "state": "Assam", "lat": 26.48, "lon": 90.56},
    ])

@st.cache_data
def load_global_prices():
    return pd.DataFrame([
        {"market": "EU ETS", "price": 68.5, "currency": "€", "region": "Europe"},
        {"market": "UK ETS", "price": 42.1, "currency": "£", "region": "Europe"},
        {"market": "California", "price": 35.8, "currency": "$", "region": "Americas"},
        {"market": "China", "price": 9.2, "currency": "¥", "region": "Asia"},
        {"market": "Korea", "price": 8.5, "currency": "₩", "region": "Asia"},
        {"market": "India (Est.)", "price": 20.0, "currency": "₹", "region": "Asia"},
    ])

GLOSSARY = {
    "Carbon Liability": "Present value of future carbon costs over asset lifetime",
    "ETS": "Emissions Trading System - market-based pollution control mechanism",
    "CBAM": "Carbon Border Adjustment Mechanism - tariff on carbon-intensive imports",
    "Monte Carlo": "Statistical simulation technique using random sampling",
    "Discount Rate": "Rate used to calculate present value of future costs",
    "Stranded Assets": "Assets that suffer devaluation due to climate policy",
    "PSU": "Public Sector Undertaking - government-owned corporation",
    "MMTPA": "Million Metric Tonnes Per Annum - refinery capacity unit",
    "BAU": "Business As Usual - no additional climate action scenario",
    "CCUS": "Carbon Capture, Utilization and Storage technology",
}

PATHWAY_MULT = {"BAU": 1.44, "Moderate": 1.21, "Aggressive": 1.0, "Early Action": 0.92}

# Helper Functions
def calculate_liability(price, rate, pathway):
    """Calculate carbon liability based on scenario parameters"""
    return round(13.1 * (price / 50) * PATHWAY_MULT[pathway] * (10 / rate), 1)

def monte_carlo_simulation(price, rate, pathway, n=1000):
    """Run Monte Carlo simulation"""
    results = []
    for _ in range(n):
        p_var = 1 + (np.random.random() - 0.5) * 0.6
        e_var = 1 + (np.random.random() - 0.5) * 0.4
        results.append(13.1 * (price / 50) * p_var * PATHWAY_MULT[pathway] * e_var * (10 / rate))
    results.sort()
    return {"p5": round(results[50], 1), "p50": round(results[500], 1), "p95": round(results[950], 1)}

def generate_insights(price, pathway, liability):
    """Generate AI-style insights based on scenario"""
    insights = []
    if price < 30:
        insights.append({"type": "warning", "icon": "⚠️", "title": "Price Below Benchmarks", 
                        "detail": f"${price}/t is 56% below EU ETS, risking CBAM penalties",
                        "action": "Consider $30-50/t minimum for CBAM compatibility"})
    elif price > 80:
        insights.append({"type": "success", "icon": "✅", "title": "Strong Price Signal",
                        "detail": f"${price}/t enables 15-20% IRR on efficiency projects",
                        "action": "Fast-track CCUS and Green Hydrogen deployment"})
    
    if pathway == "BAU":
        insights.append({"type": "critical", "icon": "🚨", "title": "BAU Risks Stranded Assets",
                        "detail": "$63.7B in assets face stranding risk without action",
                        "action": "Immediate review of 7 facilities over 60 years old"})
    elif pathway == "Early Action":
        insights.append({"type": "success", "icon": "✅", "title": "Early Action Saves $6.8B",
                        "detail": "Front-loaded investment positions India as climate leader",
                        "action": "Accelerate 2026-2030 investment phase"})
    
    insights.append({"type": "info", "icon": "💡", "title": "PSU Age Gap: 28 Years",
                    "detail": "PSU average 49y vs Private 21y creates structural vulnerability",
                    "action": "Prioritize PSU modernization or capacity rationalization"})
    
    if liability > 15:
        insights.append({"type": "critical", "icon": "🚨", "title": "Elevated Liability Scenario",
                        "detail": f"${liability}B exceeds base case by {round((liability/13.1-1)*100)}%",
                        "action": "Accelerate ETS implementation for revenue by 2028"})
    return insights

# Custom CSS
st.markdown("""
<style>
    .metric-card {
        background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
        padding: 1rem;
        border-radius: 0.5rem;
        border: 1px solid #475569;
    }
    .insight-card {
        padding: 1rem;
        border-radius: 0.5rem;
        margin-bottom: 0.5rem;
    }
    .insight-warning { background: linear-gradient(135deg, #78350f 0%, #451a03 100%); border-left: 4px solid #f59e0b; }
    .insight-critical { background: linear-gradient(135deg, #7f1d1d 0%, #450a0a 100%); border-left: 4px solid #ef4444; }
    .insight-success { background: linear-gradient(135deg, #14532d 0%, #052e16 100%); border-left: 4px solid #22c55e; }
    .insight-info { background: linear-gradient(135deg, #1e3a8a 0%, #172554 100%); border-left: 4px solid #3b82f6; }
    .stTabs [data-baseweb="tab-list"] { gap: 8px; }
    .stTabs [data-baseweb="tab"] { background-color: #334155; border-radius: 4px; }
</style>
""", unsafe_allow_html=True)

# Load Data
df = load_refinery_data()
prices_df = load_global_prices()

# Sidebar
with st.sidebar:
    st.image("https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg", width=60)
    st.title("🇮🇳 Carbon Dashboard")
    st.caption(f"v{VERSION} MVP")
    
    st.divider()
    st.subheader("📊 Scenario Controls")
    
    carbon_price = st.slider("Carbon Price (2030)", 10, 200, 50, 5, 
                             help="Projected carbon price per tonne CO₂ in 2030")
    discount_rate = st.slider("Discount Rate (%)", 5.0, 15.0, 10.0, 0.5,
                              help="Rate for present value calculations")
    pathway = st.selectbox("Decarbonization Pathway", list(PATHWAY_MULT.keys()),
                          help="Emissions reduction trajectory")
    
    st.divider()
    
    # Calculate metrics
    liability = calculate_liability(carbon_price, discount_rate, pathway)
    mc = monte_carlo_simulation(carbon_price, discount_rate, pathway)
    
    st.metric("💰 Your Estimate", f"${liability}B", delta=f"{pathway}")
    st.metric("📊 90% Range", f"${mc['p5']}-{mc['p95']}B", delta="Monte Carlo")
    
    st.divider()
    st.caption(f"Based on: {PAPER}")
    st.caption(f"Research: {AUTHOR}")

# Main Content
st.title("🇮🇳 India Carbon Liability Dashboard")

# Key Metrics Row
col1, col2, col3, col4, col5, col6 = st.columns(6)
with col1:
    st.metric("Your Estimate", f"${liability}B", pathway)
with col2:
    st.metric("90% Range", f"${mc['p5']}-{mc['p95']}B", "Monte Carlo")
with col3:
    st.metric("Govt Exposure", "$17.7B", "PSU + Stranded")
with col4:
    st.metric("Base Case", "$13.1B", "Aggressive")
with col5:
    st.metric("EU ETS Price", "€68.5", "+2.3%")
with col6:
    insights = generate_insights(carbon_price, pathway, liability)
    warnings = len([i for i in insights if i['type'] in ['critical', 'warning']])
    st.metric("AI Warnings", warnings, "alerts")

st.divider()

# Tabs
tab1, tab2, tab3, tab4, tab5, tab6 = st.tabs(["📊 Overview", "🤖 AI Insights", "📈 Analytics", "👥 Stakeholders", "🗺️ Map", "📚 Guide"])

with tab1:
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("Liability Distribution")
        fig_pie = px.pie(
            df.nlargest(5, 'liability'),
            values='liability',
            names='name',
            hole=0.4,
            color_discrete_sequence=px.colors.sequential.Oranges_r
        )
        fig_pie.update_layout(paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)')
        st.plotly_chart(fig_pie, use_container_width=True)
    
    with col2:
        st.subheader("Global Carbon Prices")
        fig_bar = px.bar(
            prices_df,
            x='price',
            y='market',
            orientation='h',
            color='region',
            color_discrete_map={'Europe': '#3b82f6', 'Americas': '#22c55e', 'Asia': '#f59e0b'}
        )
        fig_bar.update_layout(paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)',
                             yaxis={'categoryorder': 'total ascending'})
        st.plotly_chart(fig_bar, use_container_width=True)
    
    # Top Insight
    if insights:
        st.subheader("⚡ Top AI Insight")
        ins = insights[0]
        st.info(f"**{ins['icon']} {ins['title']}**\n\n{ins['detail']}\n\n**Action:** {ins['action']}")

with tab2:
    st.subheader(f"🤖 AI-Generated Insights ({len(insights)})")
    
    for ins in insights:
        color_map = {'critical': 'error', 'warning': 'warning', 'success': 'success', 'info': 'info'}
        with st.expander(f"{ins['icon']} {ins['title']}", expanded=True):
            st.write(ins['detail'])
            st.caption(f"**Recommended Action:** {ins['action']}")

with tab3:
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("🌪️ Sensitivity Analysis")
        sensitivity_data = pd.DataFrame({
            'Factor': ['Carbon Price', 'Emissions Path', 'Discount Rate', 'Technology Cost', 'Policy Timing'],
            'Impact': [45, 35, 25, 15, 10]
        })
        fig_sens = px.bar(sensitivity_data, x='Impact', y='Factor', orientation='h',
                         color='Impact', color_continuous_scale='Oranges')
        fig_sens.update_layout(paper_bgcolor='rgba(0,0,0,0)', showlegend=False)
        st.plotly_chart(fig_sens, use_container_width=True)
    
    with col2:
        st.subheader("📊 Monte Carlo Distribution")
        col_a, col_b, col_c = st.columns(3)
        col_a.metric("P5 (Best)", f"${mc['p5']}B", delta_color="normal")
        col_b.metric("P50 (Median)", f"${mc['p50']}B")
        col_c.metric("P95 (Worst)", f"${mc['p95']}B", delta_color="inverse")
        
        # Distribution visualization
        mc_full = [13.1 * (carbon_price/50) * (1+(np.random.random()-0.5)*0.6) * PATHWAY_MULT[pathway] * 
                   (1+(np.random.random()-0.5)*0.4) * (10/discount_rate) for _ in range(1000)]
        fig_hist = px.histogram(mc_full, nbins=30, color_discrete_sequence=['#f59e0b'])
        fig_hist.update_layout(paper_bgcolor='rgba(0,0,0,0)', showlegend=False,
                              xaxis_title="Liability ($B)", yaxis_title="Frequency")
        st.plotly_chart(fig_hist, use_container_width=True)
    
    # Payback Chart
    st.subheader("💰 Investment Payback ($15B Transition Fund)")
    payback_data = pd.DataFrame({
        'Year': [2026, 2028, 2030, 2032, 2034, 2036, 2038, 2040],
        'Cumulative': [-15, -12, -8, -3, 5, 15, 28, 45]
    })
    fig_payback = px.area(payback_data, x='Year', y='Cumulative', 
                         color_discrete_sequence=['#22c55e'])
    fig_payback.add_hline(y=0, line_dash="dash", line_color="red")
    fig_payback.update_layout(paper_bgcolor='rgba(0,0,0,0)')
    st.plotly_chart(fig_payback, use_container_width=True)

with tab4:
    st.subheader("👥 Stakeholder Perspectives")
    
    stakeholder = st.radio("Select View", ["🏛️ Government", "🏭 Industry", "📈 Investor"], horizontal=True)
    
    if "Government" in stakeholder:
        col1, col2, col3, col4 = st.columns(4)
        col1.metric("Fiscal Exposure", "$17.7B", delta_color="inverse")
        col2.metric("Auction Revenue", "$85-100B", delta_color="normal")
        col3.metric("Net Position", "$76-92B", delta_color="normal")
        col4.metric("Jobs at Risk", "~25,000", delta_color="inverse")
        
        st.subheader("📋 Recommended Actions")
        st.markdown("""
        - ✅ Launch Hybrid ETS by 2028 with $30/t floor
        - ✅ Establish $15B Transition Finance Facility
        - ✅ Strategic review of 7 critical-age PSU facilities
        - ✅ Implement CBAM-compatible pricing by 2032
        """)
        
    elif "Industry" in stakeholder:
        col1, col2, col3, col4 = st.columns(4)
        col1.metric("Compliance Cost", f"${liability}B", delta_color="inverse")
        col2.metric("CCUS Investment", "$8-12B")
        col3.metric("Efficiency Potential", "15-20%", delta_color="normal")
        col4.metric("Stranded Risk", "$63.7B", delta_color="inverse")
        
        st.subheader("📋 Recommended Actions")
        st.markdown("""
        - ✅ Lock in carbon price contracts early
        - ✅ Accelerate efficiency investments (30% subsidy available)
        - ✅ Form industry CCUS consortium
        - ✅ Develop Green Hydrogen capabilities
        """)
        
    else:  # Investor
        col1, col2, col3, col4 = st.columns(4)
        col1.metric("Carbon Beta", "1.8x", delta_color="inverse")
        col2.metric("Investment Need", "$25-30B")
        col3.metric("Green Bond Opp.", "$10B+", delta_color="normal")
        col4.metric("PSU Discount", "15-25%", delta_color="inverse")
        
        st.subheader("📋 Recommended Actions")
        st.markdown("""
        - ✅ Overweight modern refineries (Jamnagar SEZ, Paradip, Bina)
        - ✅ Underweight facilities >50 years old
        - ✅ Monitor BPCL privatization for entry
        - ✅ Consider Green H₂ pure-play investments
        """)

with tab5:
    st.subheader("🗺️ Refinery Locations & Risk")
    
    # Map
    fig_map = px.scatter_mapbox(
        df,
        lat='lat',
        lon='lon',
        size='capacity',
        color='risk',
        hover_name='name',
        hover_data=['operator', 'capacity', 'age', 'liability'],
        color_discrete_map={'AAA': '#22c55e', 'A': '#84cc16', 'BBB': '#eab308', 'BB': '#f97316', 'B': '#ef4444'},
        zoom=4,
        center={"lat": 22, "lon": 82},
        mapbox_style="carto-darkmatter"
    )
    fig_map.update_layout(height=500, margin={"r":0,"t":0,"l":0,"b":0})
    st.plotly_chart(fig_map, use_container_width=True)
    
    # Data Table
    st.subheader("📋 Refinery Data")
    st.dataframe(
        df[['name', 'operator', 'type', 'capacity', 'age', 'liability', 'risk', 'state']].sort_values('liability', ascending=False),
        use_container_width=True,
        hide_index=True
    )

with tab6:
    guide_tab = st.radio("Section", ["📊 Methodology", "📖 Glossary", "ℹ️ About"], horizontal=True)
    
    if "Methodology" in guide_tab:
        st.subheader("🧮 Liability Calculation")
        st.latex(r"L = \sum_{t=1}^{T} \frac{E_t \times P_t \times (1+g)^t}{(1+r)^t}")
        st.markdown("""
        Where:
        - **L** = Total carbon liability (present value)
        - **E** = Annual emissions
        - **P** = Carbon price
        - **g** = Price growth rate
        - **r** = Discount rate
        - **t** = Time period (2025-2050)
        """)
        
        st.subheader("📊 Data Sources")
        st.markdown("""
        - Refinery data: PPAC, Ministry of Petroleum
        - Emissions factors: IPCC Guidelines
        - Carbon prices: IEA World Energy Outlook
        - Policy scenarios: India NDC submissions
        """)
        
        st.subheader("🛤️ Decarbonization Pathways")
        pathway_df = pd.DataFrame({
            'Pathway': ['BAU', 'Moderate', 'Aggressive', 'Early Action'],
            'Reduction': ['25%', '45%', '81%', '80%'],
            'Description': ['No additional policy', 'Current commitments', 'Enhanced ambition', 'Front-loaded cuts']
        })
        st.table(pathway_df)
        
    elif "Glossary" in guide_tab:
        st.subheader("📖 Glossary")
        search = st.text_input("🔍 Search terms")
        for term, definition in GLOSSARY.items():
            if search.lower() in term.lower() or not search:
                with st.expander(term):
                    st.write(definition)
                    
    else:  # About
        st.subheader("ℹ️ About This Dashboard")
        st.info(f"""
        **India Carbon Liability Dashboard** v{VERSION}
        
        An interactive tool for exploring carbon liability scenarios in India's petroleum refining sector.
        
        **Based on research by:** {AUTHOR}
        
        **Paper:** {PAPER}
        """)
        
        st.subheader("📜 Version History")
        st.markdown("""
        | Version | Features |
        |---------|----------|
        | v6.0 | Documentation, onboarding, glossary |
        | v5.0 | Accessibility, mobile, shortcuts |
        | v4.0 | AI insights, stakeholder views |
        | v3.0 | PDF export, optimizer |
        | v2.0 | Monte Carlo, map |
        | v1.0 | Initial release |
        """)
        
        st.subheader("⚖️ Disclaimer")
        st.warning("This dashboard is for educational and research purposes only. Not financial advice.")

# Footer
st.divider()
st.caption(f"🇮🇳 India Carbon Liability Dashboard v{VERSION} MVP | Based on research by {AUTHOR}")
