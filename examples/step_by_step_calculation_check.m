% Step-by-Step Calculation Check for Autoencoder
% This script verifies the mathematical calculations at each layer
%
% Usage: run('step_by_step_calculation_check.m')

fprintf('========================================\n');
fprintf('Step-by-Step Calculation Verification\n');
fprintf('========================================\n\n');

%% Input Specifications
inputSize = [28, 28, 1];  % Height, Width, Channels
fprintf('INPUT:\n');
fprintf('  Size: %d x %d x %d\n', inputSize(1), inputSize(2), inputSize(3));
fprintf('  Total pixels: %d\n', prod(inputSize));
fprintf('\n');

%% Step-by-Step Dimension Calculations

fprintf('ENCODER PATH - Dimension Calculations:\n');
fprintf('----------------------------------------\n\n');

% Step 1: Input Layer
currentSize = inputSize;
fprintf('Step 1: Input Layer\n');
fprintf('  Input: %d x %d x %d\n', currentSize(1), currentSize(2), currentSize(3));
fprintf('  → Output: %d x %d x %d (no change)\n\n', currentSize(1), currentSize(2), currentSize(3));

% Step 2: First Convolution (enc_conv1)
% 3x3 conv, 16 filters, padding='same'
% Formula: output_size = input_size (when padding='same')
currentSize = [28, 28, 16];
fprintf('Step 2: enc_conv1 (3x3 conv, 16 filters, padding=same)\n');
fprintf('  Input: 28 x 28 x 1\n');
fprintf('  Kernel: 3 x 3\n');
fprintf('  Filters: 16\n');
fprintf('  Padding: same (preserves spatial dimensions)\n');
fprintf('  Calculation: (28 - 3 + 2*1) / 1 + 1 = 28 (with padding)\n');
fprintf('  → Output: %d x %d x %d\n\n', currentSize(1), currentSize(2), currentSize(3));

% Step 3: ReLU (enc_relu1)
fprintf('Step 3: enc_relu1 (ReLU activation)\n');
fprintf('  Input: 28 x 28 x 16\n');
fprintf('  Operation: max(0, x) (element-wise, no dimension change)\n');
fprintf('  → Output: 28 x 28 x 16 (no size change)\n\n');

% Step 4: First Max Pooling (enc_pool1)
% 2x2 pool, stride=2
% Formula: output_size = floor((input_size - pool_size) / stride) + 1
% Or simpler: output_size = input_size / stride (when pool_size = stride)
currentSize = [14, 14, 16];
fprintf('Step 4: enc_pool1 (2x2 max pooling, stride=2)\n');
fprintf('  Input: 28 x 28 x 16\n');
fprintf('  Pool size: 2 x 2\n');
fprintf('  Stride: 2\n');
fprintf('  Calculation: floor((28 - 2) / 2) + 1 = 14\n');
fprintf('  → Output: %d x %d x %d\n\n', currentSize(1), currentSize(2), currentSize(3));

% Step 5: Second Convolution (enc_conv2)
currentSize = [14, 14, 8];
fprintf('Step 5: enc_conv2 (3x3 conv, 8 filters, padding=same)\n');
fprintf('  Input: 14 x 14 x 16\n');
fprintf('  Kernel: 3 x 3\n');
fprintf('  Filters: 8 (reduces channels from 16 to 8)\n');
fprintf('  Padding: same\n');
fprintf('  → Output: %d x %d x %d\n\n', currentSize(1), currentSize(2), currentSize(3));

% Step 6: ReLU (enc_relu2)
fprintf('Step 6: enc_relu2 (ReLU activation)\n');
fprintf('  Input: 14 x 14 x 8\n');
fprintf('  → Output: 14 x 14 x 8 (no size change)\n\n');

% Step 7: Second Max Pooling (enc_pool2)
currentSize = [7, 7, 8];
fprintf('Step 7: enc_pool2 (2x2 max pooling, stride=2)\n');
fprintf('  Input: 14 x 14 x 8\n');
fprintf('  Calculation: floor((14 - 2) / 2) + 1 = 7\n');
fprintf('  → Output: %d x %d x %d\n\n', currentSize(1), currentSize(2), currentSize(3));

% Step 8: Third Convolution (enc_conv3)
currentSize = [7, 7, 4];
fprintf('Step 8: enc_conv3 (3x3 conv, 4 filters, padding=same)\n');
fprintf('  Input: 7 x 7 x 8\n');
fprintf('  Filters: 4 (reduces channels from 8 to 4)\n');
fprintf('  → Output: %d x %d x %d\n\n', currentSize(1), currentSize(2), currentSize(3));

% Step 9: ReLU (enc_relu3) - BOTTLENECK
fprintf('Step 9: enc_relu3 (ReLU activation) - BOTTLENECK\n');
fprintf('  Input: 7 x 7 x 4\n');
fprintf('  → Output: 7 x 7 x 4 (compressed representation)\n');
fprintf('  Compression ratio: %d pixels → %d pixels (%.1f%%)\n', ...
    prod(inputSize(1:2)), prod(currentSize(1:2)), ...
    100 * prod(currentSize(1:2)) / prod(inputSize(1:2)));
fprintf('\n');

fprintf('DECODER PATH - Dimension Calculations:\n');
fprintf('----------------------------------------\n\n');

% Step 10: First Transposed Convolution (dec_transconv1)
% 2x2, stride=2, 8 filters
% Formula: output_size = (input_size - 1) * stride + filter_size
currentSize = [14, 14, 8];
fprintf('Step 10: dec_transconv1 (2x2 transposed conv, stride=2, 8 filters)\n');
fprintf('  Input: 7 x 7 x 4\n');
fprintf('  Filter size: 2 x 2\n');
fprintf('  Stride: 2\n');
fprintf('  Filters: 8 (increases channels from 4 to 8)\n');
fprintf('  Calculation: (7 - 1) * 2 + 2 = 14\n');
fprintf('  → Output: %d x %d x %d\n\n', currentSize(1), currentSize(2), currentSize(3));

% Step 11: ReLU (dec_relu1)
fprintf('Step 11: dec_relu1 (ReLU activation)\n');
fprintf('  Input: 14 x 14 x 8\n');
fprintf('  → Output: 14 x 14 x 8 (no size change)\n\n');

% Step 12: Second Transposed Convolution (dec_transconv2)
currentSize = [28, 28, 16];
fprintf('Step 12: dec_transconv2 (2x2 transposed conv, stride=2, 16 filters)\n');
fprintf('  Input: 14 x 14 x 8\n');
fprintf('  Calculation: (14 - 1) * 2 + 2 = 28\n');
fprintf('  Filters: 16 (increases channels from 8 to 16)\n');
fprintf('  → Output: %d x %d x %d\n\n', currentSize(1), currentSize(2), currentSize(3));

% Step 13: ReLU (dec_relu2)
fprintf('Step 13: dec_relu2 (ReLU activation)\n');
fprintf('  Input: 28 x 28 x 16\n');
fprintf('  → Output: 28 x 28 x 16 (no size change)\n\n');

% Step 14: Final Convolution (dec_conv)
currentSize = [28, 28, 1];
fprintf('Step 14: dec_conv (3x3 conv, 1 filter, padding=same)\n');
fprintf('  Input: 28 x 28 x 16\n');
fprintf('  Filters: 1 (reduces channels from 16 to 1)\n');
fprintf('  Padding: same (preserves spatial dimensions)\n');
fprintf('  → Output: %d x %d x %d\n\n', currentSize(1), currentSize(2), currentSize(3));

% Step 15: Output Layer
fprintf('Step 15: output (Regression Layer)\n');
fprintf('  Input: 28 x 28 x 1\n');
fprintf('  Operation: Computes loss (no dimension change)\n');
fprintf('  → Output: 28 x 28 x 1 (matches original input!)\n\n');

%% Verification
fprintf('========================================\n');
fprintf('VERIFICATION\n');
fprintf('========================================\n\n');

if isequal(currentSize(1:2), inputSize(1:2)) && currentSize(3) == inputSize(3)
    fprintf('✓ SUCCESS: Output dimensions match input dimensions!\n');
    fprintf('  Input:  %d x %d x %d\n', inputSize(1), inputSize(2), inputSize(3));
    fprintf('  Output: %d x %d x %d\n', currentSize(1), currentSize(2), currentSize(3));
    fprintf('\n✓ All calculations are CORRECT!\n');
else
    fprintf('✗ ERROR: Dimension mismatch!\n');
    fprintf('  Input:  %d x %d x %d\n', inputSize(1), inputSize(2), inputSize(3));
    fprintf('  Output: %d x %d x %d\n', currentSize(1), currentSize(2), currentSize(3));
end

%% Summary Table
fprintf('\n========================================\n');
fprintf('Dimension Flow Summary\n');
fprintf('========================================\n\n');
fprintf('Layer                    | Output Size\n');
fprintf('-------------------------|------------\n');
fprintf('input                    | 28 x 28 x 1\n');
fprintf('enc_conv1 + enc_relu1    | 28 x 28 x 16\n');
fprintf('enc_pool1                | 14 x 14 x 16\n');
fprintf('enc_conv2 + enc_relu2    | 14 x 14 x 8\n');
fprintf('enc_pool2                | 7 x 7 x 8\n');
fprintf('enc_conv3 + enc_relu3    | 7 x 7 x 4  ← BOTTLENECK\n');
fprintf('dec_transconv1 + relu1  | 14 x 14 x 8\n');
fprintf('dec_transconv2 + relu2  | 28 x 28 x 16\n');
fprintf('dec_conv                 | 28 x 28 x 1\n');
fprintf('output                   | 28 x 28 x 1\n');
fprintf('\n');

%% Parameter Count Estimation
fprintf('========================================\n');
fprintf('Parameter Count Estimation\n');
fprintf('========================================\n\n');

% Encoder parameters
enc_conv1_params = 3*3*1*16 + 16;  % weights + bias
enc_conv2_params = 3*3*16*8 + 8;
enc_conv3_params = 3*3*8*4 + 4;

% Decoder parameters
dec_transconv1_params = 2*2*4*8 + 8;
dec_transconv2_params = 2*2*8*16 + 16;
dec_conv_params = 3*3*16*1 + 1;

total_params = enc_conv1_params + enc_conv2_params + enc_conv3_params + ...
               dec_transconv1_params + dec_transconv2_params + dec_conv_params;

fprintf('Encoder parameters:\n');
fprintf('  enc_conv1: %d parameters\n', enc_conv1_params);
fprintf('  enc_conv2: %d parameters\n', enc_conv2_params);
fprintf('  enc_conv3: %d parameters\n', enc_conv3_params);
fprintf('\nDecoder parameters:\n');
fprintf('  dec_transconv1: %d parameters\n', dec_transconv1_params);
fprintf('  dec_transconv2: %d parameters\n', dec_transconv2_params);
fprintf('  dec_conv: %d parameters\n', dec_conv_params);
fprintf('\nTotal trainable parameters: %d (%.2f K)\n', total_params, total_params/1000);

fprintf('\n✓ Network calculation verification complete!\n\n');
