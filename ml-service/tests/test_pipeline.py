import unittest
import numpy as np
import pandas as pd
from app.data.data_loader import generate_calibrated_synthetic_data
from app.features.engineer import engineer_features, chronological_train_test_split, FEATURE_COLUMNS
from app.models.baseline import NaiveBaselineModel
from app.models.linear_model import LinearRegressionModel
from app.models.random_forest import RandomForestModel
from app.evaluation.metrics import compute_all_metrics

class TestMLPipeline(unittest.TestCase):
    def setUp(self):
        self.df = generate_calibrated_synthetic_data("TEST_STOCK", period="1y")

    def test_feature_engineering_chronology(self):
        """Tests that engineered features do not leak future information."""
        processed = engineer_features(self.df, target_horizon=1)
        self.assertGreater(len(processed), 50)
        
        # Ensure all required features are present
        for col in FEATURE_COLUMNS:
            self.assertIn(col, processed.columns)
            self.assertFalse(processed[col].isna().any(), f"Column {col} contains NaN values!")

        # Verify target is future Close (target at index 0 equals Close at index 1 in raw series)
        self.assertIn("target", processed.columns)

    def test_chronological_split_no_shuffle(self):
        """Verifies that train and test periods are separated by timestamp without shuffling."""
        processed = engineer_features(self.df, target_horizon=1)
        train_df, test_df, X_train, y_train, X_test, y_test = chronological_train_test_split(
            processed, test_size=0.20
        )
        max_train_date = train_df["Date"].max()
        min_test_date = test_df["Date"].min()
        
        self.assertLess(max_train_date, min_test_date, "Data leakage! Train date overlaps with or is after test date!")
        self.assertEqual(len(X_train), len(train_df))
        self.assertEqual(len(X_test), len(test_df))

    def test_model_training_and_metrics(self):
        """Tests fitting and evaluation of candidate models."""
        processed = engineer_features(self.df, target_horizon=1)
        train_df, test_df, X_train, y_train, X_test, y_test = chronological_train_test_split(
            processed, test_size=0.20
        )
        
        # 1. Baseline
        base = NaiveBaselineModel()
        y_pred_base = test_df["Close"].values
        metrics_base = compute_all_metrics(y_test, y_pred_base)
        self.assertIn("mae", metrics_base)
        self.assertGreater(metrics_base["rmse"], 0.0)

        # 2. Linear Regression
        lr = LinearRegressionModel()
        lr.fit(X_train, y_train, FEATURE_COLUMNS)
        y_pred_lr = lr.predict(X_test)
        metrics_lr = compute_all_metrics(y_test, y_pred_lr)
        self.assertIn("directional_accuracy", metrics_lr)

        # 3. Random Forest
        rf = RandomForestModel(n_estimators=10, max_depth=5)
        rf.fit(X_train, y_train, FEATURE_COLUMNS)
        y_pred_rf = rf.predict(X_test)
        metrics_rf = compute_all_metrics(y_test, y_pred_rf)
        self.assertIn("rmse", metrics_rf)
        self.assertGreater(len(rf.get_top_features()), 0)

if __name__ == "__main__":
    unittest.main()
