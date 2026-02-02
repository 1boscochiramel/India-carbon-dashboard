# 🇮🇳 India Carbon Liability Dashboard

[![Streamlit App](https://static.streamlit.io/badges/streamlit_badge_black_white.svg)](https://carbon-liability-india.streamlit.app)
[![Python 3.9+](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Interactive dashboard for exploring carbon liability scenarios in India's petroleum refining sector.

![Dashboard Screenshot](screenshot.png)

## 📊 Features

| Feature | Description |
|---------|-------------|
| **Scenario Modeling** | Adjust carbon price ($10-200/t), discount rate (5-15%), pathways |
| **Monte Carlo Simulation** | 1,000 simulations for uncertainty analysis |
| **AI Insights** | Automated recommendations based on scenario |
| **Stakeholder Views** | Government, Industry, Investor perspectives |
| **Interactive Map** | 23 refineries with risk ratings |
| **Documentation** | Methodology, glossary, citations |

## 🚀 Quick Start

### Option 1: Streamlit Cloud (Recommended)
```bash
# Deploy directly to Streamlit Cloud
# Fork this repo, connect to streamlit.io
```

### Option 2: Local Installation
```bash
# Clone repository
git clone https://github.com/bosco-chiramel/india-carbon-dashboard.git
cd india-carbon-dashboard

# Install dependencies
pip install -r requirements.txt

# Run app
streamlit run app.py
```

### Option 3: Docker
```bash
docker build -t carbon-dashboard .
docker run -p 8501:8501 carbon-dashboard
```

## 📁 Project Structure

```
india-carbon-dashboard/
├── app.py                    # Streamlit application
├── carbon_liability.py       # Python library
├── requirements.txt          # Dependencies
├── README.md                 # Documentation
├── Dockerfile               # Container config
├── .streamlit/
│   └── config.toml          # Streamlit config
└── react/
    └── CarbonDashboard.jsx  # React version
```

## 📈 Data Coverage

- **23 Refineries** across India
- **225.6 MMTPA** total capacity
- **$13.1B** base carbon liability
- **5 Scenarios**: Low, Base, High, EU, SCC
- **4 Pathways**: BAU, Moderate, Aggressive, Early Action

## 🔬 Methodology

### Liability Calculation
```
L = Σ(Et × Pt × (1+g)^t) / (1+r)^t
```
- L = Total liability (present value)
- E = Annual emissions
- P = Carbon price
- g = Price growth rate
- r = Discount rate
- t = Time period (2025-2050)

### Risk Ratings
| Rating | Criteria |
|--------|----------|
| AAA | Age <20y, Efficiency >75% |
| A | Age 20-30y, Efficiency 70-75% |
| BBB | Age 30-45y, Efficiency 65-70% |
| BB | Age 45-60y, Efficiency 55-65% |
| B | Age >60y, Efficiency <55% |

## 🐍 Python Library Usage

```python
from carbon_liability import CarbonModel

# Initialize model
model = CarbonModel()

# Calculate liability
liability = model.calculate_liability(
    carbon_price=50,
    discount_rate=10,
    pathway='Aggressive'
)
print(f"Liability: ${liability}B")

# Run Monte Carlo
mc = model.monte_carlo(n_simulations=1000)
print(f"90% CI: ${mc['p5']}B - ${mc['p95']}B")

# Get insights
insights = model.generate_insights()
for i in insights:
    print(f"{i['icon']} {i['title']}")
```

## 🎨 React Version

```bash
cd react
npm install
npm start
```

## 📚 Citation

```bibtex
@misc{chiramel2025carbon,
  author = {Chiramel, Bosco},
  title = {Carbon Liability and Decarbonization Pathways for India's Petroleum Refining Sector},
  year = {2025},
  publisher = {GitHub},
  url = {https://github.com/bosco-chiramel/india-carbon-dashboard}
}
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file.

## 🙏 Acknowledgments

- Research by Bosco Chiramel
- Data from PPAC, Ministry of Petroleum
- Carbon price scenarios from IEA

---

**⭐ Star this repo if you find it useful!**
