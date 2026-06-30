package com.xhs.meetingroom.common.page;

import com.baomidou.mybatisplus.core.metadata.IPage;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Function;

/**
 * 统一分页响应。
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PageVO<T> {

    private long total;
    private long pageNum;
    private long pageSize;
    private List<T> records;

    /** 从 MyBatis Plus IPage 转换为前端 VO */
    public static <E, V> PageVO<V> of(IPage<E> page, Function<E, V> converter) {
        List<V> list = new ArrayList<>();
        for (E e : page.getRecords()) {
            list.add(converter.apply(e));
        }
        return new PageVO<>(page.getTotal(), page.getCurrent(), page.getSize(), list);
    }

    public static <T> PageVO<T> empty(long pageNum, long pageSize) {
        return new PageVO<>(0, pageNum, pageSize, List.of());
    }
}
