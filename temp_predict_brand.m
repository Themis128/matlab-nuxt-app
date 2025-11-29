
  try
    % Ensure project paths are available
    cd('D:/Nuxt Projects/MatLab');
    if exist('setup_matlab_env.m', 'file')
      run('setup_matlab_env.m');
    else
      addpath(genpath(pwd));
    end

    % Move to mobiles dataset docs folder
    cd('D:/Nuxt Projects/MatLab/mobiles-dataset-docs');

    % Call prediction function
    brand = predict_brand(8, 5000, 6.5, 174, 2024, 999);
    fprintf('BRAND_RESULT:%s\n', char(brand));
  catch ME
    fprintf('ERROR:%s\n', ME.message);
    exit(1);
  end
  exit(0);
  