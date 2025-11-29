"""
Prediction Monitoring Script
Tracks real-world prediction errors and logs them for analysis
"""

import json
import csv
from datetime import datetime
from pathlib import Path
from typing import Dict, Optional
import numpy as np

# Import prediction functions
from predictions_sklearn import predict_price, predict_ram, predict_battery, predict_brand

MONITORING_DIR = Path(__file__).parent / "monitoring"
MONITORING_DIR.mkdir(exist_ok=True)

LOG_FILE = MONITORING_DIR / "prediction_log.jsonl"
ERROR_LOG = MONITORING_DIR / "error_log.csv"
STATS_FILE = MONITORING_DIR / "prediction_stats.json"


def log_prediction(
    prediction_type: str,
    inputs: Dict,
    predicted: float,
    actual: Optional[float] = None,
    error: Optional[float] = None
):
    """Log a prediction for monitoring"""
    timestamp = datetime.now().isoformat()

    log_entry = {
        "timestamp": timestamp,
        "type": prediction_type,
        "inputs": inputs,
        "predicted": predicted,
        "actual": actual,
        "error": error,
        "error_pct": (error / actual * 100) if actual and error else None
    }

    # Append to JSONL log
    with open(LOG_FILE, 'a') as f:
        f.write(json.dumps(log_entry) + '\n')

    # If actual value provided, log error
    if actual is not None and error is not None:
        with open(ERROR_LOG, 'a', newline='') as f:
            writer = csv.writer(f)
            if ERROR_LOG.stat().st_size == 0:  # Write header if new file
                writer.writerow(['timestamp', 'type', 'predicted', 'actual', 'error', 'error_pct'])
            writer.writerow([
                timestamp, prediction_type, predicted, actual, error,
                error / actual * 100 if actual != 0 else 0
            ])


def calculate_stats():
    """Calculate statistics from logged predictions"""
    if not ERROR_LOG.exists() or ERROR_LOG.stat().st_size == 0:
        return None

    errors = []
    error_pcts = []

    with open(ERROR_LOG, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            errors.append(float(row['error']))
            error_pcts.append(float(row['error_pct']))

    if not errors:
        return None

    stats = {
        "total_predictions": len(errors),
        "mean_error": np.mean(errors),
        "median_error": np.median(errors),
        "std_error": np.std(errors),
        "mean_error_pct": np.mean(error_pcts),
        "median_error_pct": np.median(error_pcts),
        "std_error_pct": np.std(error_pcts),
        "last_updated": datetime.now().isoformat()
    }

    # Save stats
    with open(STATS_FILE, 'w') as f:
        json.dump(stats, f, indent=2)

    return stats


def print_stats():
    """Print current prediction statistics"""
    stats = calculate_stats()

    if stats is None:
        print("No prediction data logged yet.")
        return

    print("\n" + "="*80)
    print("PREDICTION MONITORING STATISTICS")
    print("="*80)
    print(f"\nTotal Predictions Logged: {stats['total_predictions']}")
    print(f"Last Updated: {stats['last_updated']}")

    print(f"\n📊 Error Statistics:")
    print(f"   Mean Error: {stats['mean_error']:.2f}")
    print(f"   Median Error: {stats['median_error']:.2f}")
    print(f"   Std Dev: {stats['std_error']:.2f}")

    print(f"\n📊 Percentage Error Statistics:")
    print(f"   Mean % Error: {stats['mean_error_pct']:.2f}%")
    print(f"   Median % Error: {stats['median_error_pct']:.2f}%")
    print(f"   Std Dev: {stats['std_error_pct']:.2f}%")

    # Performance assessment
    print(f"\n💡 Performance Assessment:")
    if stats['mean_error_pct'] < 5:
        print("   ✅ Excellent: Mean error < 5%")
    elif stats['mean_error_pct'] < 10:
        print("   ✓ Good: Mean error < 10%")
    elif stats['mean_error_pct'] < 20:
        print("   ⚠️  Acceptable: Mean error < 20%")
    else:
        print("   ❌ Poor: Mean error > 20% - consider retraining")


def test_prediction_with_actual(
    prediction_type: str,
    inputs: Dict,
    actual_value: float
):
    """Make a prediction and compare with actual value"""
    try:
        if prediction_type == "price":
            predicted = predict_price(**inputs)
        elif prediction_type == "ram":
            predicted = predict_ram(**inputs)
        elif prediction_type == "battery":
            predicted = predict_battery(**inputs)
        elif prediction_type == "brand":
            predicted = predict_brand(**inputs)
        else:
            print(f"Unknown prediction type: {prediction_type}")
            return

        error = abs(predicted - actual_value)
        log_prediction(prediction_type, inputs, predicted, actual_value, error)

        print(f"\n✅ Prediction logged:")
        print(f"   Type: {prediction_type}")
        print(f"   Predicted: {predicted}")
        print(f"   Actual: {actual_value}")
        print(f"   Error: {error:.2f} ({error/actual_value*100:.2f}%)")

    except Exception as e:
        print(f"❌ Error making prediction: {e}")


def main():
    """Main monitoring interface"""
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == "stats":
        print_stats()
        return

    print("="*80)
    print("PREDICTION MONITORING")
    print("="*80)
    print("\nThis script helps monitor real-world prediction performance.")
    print("\nUsage:")
    print("  python monitor_predictions.py stats  - View statistics")
    print("\nTo log predictions, use the test_prediction_with_actual() function")
    print("or integrate logging into your API endpoints.")

    # Show current stats if available
    if STATS_FILE.exists():
        print("\n" + "-"*80)
        print_stats()


if __name__ == "__main__":
    main()
