import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';

interface TypeToggleProps {
    transactionType: 'income' | 'expense';
    handleTypeChange: (type: 'income' | 'expense') => void;
}

const TypeToggle: React.FC<TypeToggleProps> = ({
                                                   transactionType,
                                                   handleTypeChange,
                                               }) => (
    <View className="bg-zinc-900 p-1.5 rounded-2xl flex-row border border-zinc-800">

        <TouchableOpacity
            onPress={() => handleTypeChange('expense')}
            className={`flex-1 py-3.5 rounded-xl transition-all ${
                transactionType === 'expense' ? 'bg-zinc-800 shadow-md border border-zinc-700/50' : ''
            }`}
            activeOpacity={0.7}
        >
            <Text
                className={`text-center text-sm font-bold uppercase tracking-wider ${
                    transactionType === 'expense' ? 'text-red-500' : 'text-zinc-500'
                }`}
            >
                Expense
            </Text>
        </TouchableOpacity>

        <TouchableOpacity
            onPress={() => handleTypeChange('income')}
            className={`flex-1 py-3.5 rounded-xl transition-all ${
                transactionType === 'income' ? 'bg-zinc-800 shadow-md border border-zinc-700/50' : ''
            }`}
            activeOpacity={0.7}
        >
            <Text
                className={`text-center text-sm font-bold uppercase tracking-wider ${
                    transactionType === 'income' ? 'text-emerald-500' : 'text-zinc-500'
                }`}
            >
                Income
            </Text>
        </TouchableOpacity>
    </View>
);

export default TypeToggle;