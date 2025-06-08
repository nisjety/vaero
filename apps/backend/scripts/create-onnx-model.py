#!/usr/bin/env python3
"""
Simple script to create a basic ONNX model for weather analysis.
This creates a lightweight model for demonstration purposes.
"""

import numpy as np
import onnx
from onnx import helper, TensorProto
import os

def create_simple_weather_model():
    """Create a simple ONNX model for weather advice classification"""
    
    # Define input node
    input_node = helper.make_tensor_value_info(
        'weather_input',
        TensorProto.FLOAT,
        [1, 4]  # batch_size=1, features=4 (temp, wind, precip, symbol)
    )
    
    # Define output node  
    output_node = helper.make_tensor_value_info(
        'advice_category',
        TensorProto.FLOAT,
        [1, 5]  # 5 weather advice categories
    )
    
    # Create simple linear transformation weights
    # This is a basic classification layer for weather conditions
    weights = np.array([
        [0.4, 0.3, 0.2, 0.1],  # Warm weather advice
        [0.2, 0.4, 0.3, 0.1],  # Windy weather advice  
        [0.1, 0.2, 0.6, 0.1],  # Rainy weather advice
        [0.3, 0.2, 0.1, 0.4],  # Cold weather advice
        [0.25, 0.25, 0.25, 0.25]  # Neutral advice
    ], dtype=np.float32)
    
    bias = np.array([0.1, 0.1, 0.1, 0.1, 0.1], dtype=np.float32)
    
    # Create weight and bias tensors
    weight_tensor = helper.make_tensor(
        'weights',
        TensorProto.FLOAT,
        [5, 4],
        weights.flatten()
    )
    
    bias_tensor = helper.make_tensor(
        'bias', 
        TensorProto.FLOAT,
        [5],
        bias
    )
    
    # Create MatMul node
    matmul_node = helper.make_node(
        'MatMul',
        ['weather_input', 'weights'],
        ['matmul_output']
    )
    
    # Create Add node (for bias)
    add_node = helper.make_node(
        'Add',
        ['matmul_output', 'bias'],
        ['add_output']
    )
    
    # Create Softmax node
    softmax_node = helper.make_node(
        'Softmax',
        ['add_output'],
        ['advice_category'],
        axis=1
    )
    
    # Create the graph
    graph = helper.make_graph(
        [matmul_node, add_node, softmax_node],
        'weather_advisor',
        [input_node],
        [output_node],
        [weight_tensor, bias_tensor]
    )
    
    # Create the model
    model = helper.make_model(graph, producer_name='vaero-weather-ai')
    model.opset_import[0].version = 13
    
    return model

def main():
    print("Creating simple ONNX weather model...")
    
    # Create the model
    model = create_simple_weather_model()
    
    # Validate the model
    try:
        onnx.checker.check_model(model)
        print("✅ Model validation passed")
    except Exception as e:
        print(f"❌ Model validation failed: {e}")
        return
    
    # Save the model
    output_path = "../models/weather-advisor.onnx"
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    onnx.save(model, output_path)
    print(f"✅ Model saved to {output_path}")
    
    # Print model info
    file_size = os.path.getsize(output_path) / 1024  # KB
    print(f"📊 Model size: {file_size:.1f} KB")
    print(f"📊 Input shape: [1, 4] (temperature, wind_speed, precipitation, symbol_code)")
    print(f"📊 Output shape: [1, 5] (advice categories)")

if __name__ == "__main__":
    main()
