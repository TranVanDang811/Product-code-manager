package com.pcm.productcodemanager.service;

import com.pcm.productcodemanager.dto.request.LoginRequest;
import com.pcm.productcodemanager.dto.response.LoginResponse;
import com.pcm.productcodemanager.dto.response.UserResponse;

public interface AuthService {

    LoginResponse login(LoginRequest request);

    UserResponse getCurrentUser();
}

