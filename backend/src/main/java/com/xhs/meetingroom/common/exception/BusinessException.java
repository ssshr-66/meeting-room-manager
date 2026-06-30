package com.xhs.meetingroom.common.exception;

import com.xhs.meetingroom.common.result.ResultCode;
import lombok.Getter;

/**
 * 业务异常。Service 层抛出，由 {@link GlobalExceptionHandler} 统一捕获并转换为 {@code Result.fail}。
 */
@Getter
public class BusinessException extends RuntimeException {

    private final int code;

    public BusinessException(ResultCode resultCode) {
        super(resultCode.getMessage());
        this.code = resultCode.getCode();
    }

    public BusinessException(ResultCode resultCode, String message) {
        super(message);
        this.code = resultCode.getCode();
    }

    public BusinessException(int code, String message) {
        super(message);
        this.code = code;
    }
}
