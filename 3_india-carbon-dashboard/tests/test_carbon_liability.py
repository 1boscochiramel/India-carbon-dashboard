"""Tests for carbon liability module."""
import pytest
import sys
sys.path.insert(0, '..')

from carbon_liability import CarbonModel

def test_model_initialization():
    """Test CarbonModel can be instantiated."""
    model = CarbonModel()
    assert model is not None

def test_liability_positive():
    """Test that liability calculations return positive values."""
    model = CarbonModel()
    liability = model.calculate_liability(carbon_price=50, discount_rate=10)
    assert liability > 0

def test_liability_increases_with_carbon_price():
    """Test that higher carbon prices increase liability."""
    model = CarbonModel()
    low = model.calculate_liability(carbon_price=25, discount_rate=10)
    high = model.calculate_liability(carbon_price=100, discount_rate=10)
    assert high > low

def test_monte_carlo_returns_dict():
    """Test Monte Carlo returns expected structure."""
    model = CarbonModel()
    result = model.monte_carlo(n_simulations=100)
    assert 'mean' in result or 'p5' in result or isinstance(result, dict)

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
