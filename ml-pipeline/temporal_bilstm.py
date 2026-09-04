"""
NER-LEWS Temporal Bi-LSTM with Attention Engine
Processes sequential rainfall, soil moisture, and InSAR telemetry to forecast dynamic failure probabilities.
"""

import torch
import torch.nn as nn
import torch.nn.functional as F

class TemporalAttention(nn.Module):
    def __init__(self, hidden_dim: int):
        super().__init__()
        self.attn_weights = nn.Linear(hidden_dim * 2, 1, bias=False)

    def forward(self, lstm_out: torch.Tensor):
        # lstm_out: (batch_size, seq_len, hidden_dim * 2)
        scores = self.attn_weights(lstm_out).squeeze(-1) # (batch_size, seq_len)
        alpha = F.softmax(scores, dim=-1).unsqueeze(-1)  # (batch_size, seq_len, 1)
        context = torch.sum(lstm_out * alpha, dim=1)     # (batch_size, hidden_dim * 2)
        return context, alpha

class LandslideTemporalPredictor(nn.Module):
    def __init__(self, input_dim: int = 6, hidden_dim: int = 64, num_layers: int = 2):
        super().__init__()
        # Input features: [Rain_1h, Rain_24h, Rain_72h, ARI_15d, Soil_Moisture_Pct, InSAR_Vel]
        self.bilstm = nn.LSTM(
            input_size=input_dim,
            hidden_size=hidden_dim,
            num_layers=num_layers,
            batch_first=True,
            bidirectional=True,
            dropout=0.2
        )
        self.attention = TemporalAttention(hidden_dim)
        self.fc1 = nn.Linear(hidden_dim * 2, 32)
        self.fc2 = nn.Linear(32, 1)
        self.dropout = nn.Dropout(0.2)

    def forward(self, x: torch.Tensor):
        lstm_out, _ = self.bilstm(x)
        context, attn_weights = self.attention(lstm_out)
        out = F.relu(self.fc1(self.dropout(context)))
        prob = torch.sigmoid(self.fc2(out))
        return prob, attn_weights

def export_to_onnx(model: LandslideTemporalPredictor, output_path: str = "lews_temporal.onnx"):
    """
    Exports PyTorch model to standard ONNX format for deployment in C++ / Node.js ONNX Runtime.
    """
    model.eval()
    dummy_input = torch.randn(1, 24, 6) # 1 sample, 24 hourly timesteps, 6 features
    torch.onnx.export(
        model,
        dummy_input,
        output_path,
        export_params=True,
        opset_version=14,
        input_names=["telemetry_sequence"],
        output_names=["landslide_probability", "attention_weights"],
        dynamic_axes={
            "telemetry_sequence": {0: "batch_size"},
            "landslide_probability": {0: "batch_size"}
        }
    )
    print(f"Model exported to ONNX: {output_path}")

if __name__ == "__main__":
    net = LandslideTemporalPredictor()
    dummy_batch = torch.randn(4, 24, 6)
    out_prob, attn = net(dummy_batch)
    print(f"Forward pass output shape: {out_prob.shape}, Attention shape: {attn.shape}")
    print("Temporal Bi-LSTM module initialized and tested.")
