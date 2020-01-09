import React, { useState, useMemo, useCallback, useContext } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import ReactNativeModal from "react-native-modal";

import i18next from "i18next";
import { Trans } from "react-i18next";

import type { Action, State } from "@ledgerhq/live-common/lib/apps";
import type { App } from "@ledgerhq/live-common/lib/types/manager";
import { useSortedFilteredApps } from "@ledgerhq/live-common/lib/apps/filtering";

import TextInput from "../../../components/TextInput";
import SearchIcon from "../../../icons/Search";
import NoResults from "../../../icons/NoResults";
import colors from "../../../colors";
import LText from "../../../components/LText";

import AppRow from "../AppsList/AppRow";

import getWindowDimensions from "../../../logic/getWindowDimensions";
import { ManagerContext } from "../shared";

const { width, height } = getWindowDimensions();

type Props = {
  state: State,
  dispatch: Action => void,
  tab: string,
  apps?: App[],
  sortOptions: { type: string, order: string },
};

export default ({
  state,
  dispatch,
  tab,
  apps,
  sortOptions = { type: null, order: "asc" },
}: Props) => {
  const { MANAGER_TABS } = useContext(ManagerContext);
  const [isOpened, setIsOpen] = useState(false);
  const toggleSearchModal = useCallback(
    value => () => {
      if (value) setQuery("");
      setIsOpen(value);
    },
    [setIsOpen],
  );
  const [query, setQuery] = useState(null);
  const clear = useCallback(() => setQuery(""), [setQuery]);

  const filterOptions: FilterOptions = useMemo(
    () => ({
      query,
      installedApps: [],
      type: [],
    }),
    [query, tab, MANAGER_TABS.INSTALLED_APPS],
  );

  const sortedApps: Array<App> = useSortedFilteredApps(
    apps || state.apps,
    filterOptions,
    sortOptions,
  );

  const NoResult = useMemo(
    () =>
      sortedApps.length <= 0 && (
        <View style={styles.noResult}>
          <View style={styles.noResultIcon}>
            <NoResults color={colors.fog} />
          </View>
          <LText bold style={styles.noResultText}>
            <Trans i18nKey="manager.appList.noResultsFound" />
          </LText>
          <LText style={styles.noResultDesc}>
            <Trans i18nKey="manager.appList.noResultsDesc" />
          </LText>
        </View>
      ),
    [sortedApps.length],
  );

  const renderRow = useCallback(
    ({ item, index }: { item: App, index: number }) => (
      <AppRow
        app={item}
        index={index}
        state={state}
        dispatch={dispatch}
        tab={tab}
        animation={false}
      />
    ),
    [tab, dispatch, state],
  );
  const keyExtractor = useCallback((d: App) => String(d.id) + "SEARCH", []);

  const placeholder = useMemo(
    () =>
      tab === MANAGER_TABS.CATALOG
        ? i18next.t("manager.appList.searchAppsCatalog")
        : i18next.t("manager.appList.searchAppsInstalled"),
    [tab, MANAGER_TABS.CATALOG],
  );

  const elements = [
    <View style={styles.header}>
      <View style={styles.searchBar}>
        <View style={styles.searchBarIcon}>
          <SearchIcon size={16} color={colors.smoke} />
        </View>
        <TextInput
          autoFocus
          returnKeyType="search"
          maxLength={50}
          onChangeText={setQuery}
          clearButtonMode="always"
          style={styles.searchBarTextInput}
          placeholder={placeholder}
          placeholderTextColor={colors.smoke}
          onInputCleared={clear}
          value={query}
          numberOfLines={1}
        />
      </View>
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={toggleSearchModal(false)}
      >
        <LText style={styles.cancelButtonText}>
          <Trans i18nKey="common.cancel" />
        </LText>
      </TouchableOpacity>
    </View>,
    <SafeAreaView style={styles.searchList}>
      <FlatList
        listKey="SEARCH"
        data={sortedApps}
        renderItem={renderRow}
        keyExtractor={keyExtractor}
      />
    </SafeAreaView>,
  ];

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.5}
        style={styles.searchBarInput}
        onPress={toggleSearchModal(true)}
      >
        <View style={styles.searchBarIcon}>
          <SearchIcon size={16} color={colors.smoke} />
        </View>
        <LText style={styles.searchBarTextInput}>{placeholder}</LText>
      </TouchableOpacity>
      <ReactNativeModal
        isVisible={isOpened}
        deviceWidth={width}
        deviceHeight={height}
        onBackButtonPress={toggleSearchModal(false)}
        useNativeDriver
        style={styles.modal}
      >
        <SafeAreaView>
          <FlatList
            data={elements}
            renderItem={({ item }) => item}
            keyExtractor={(_, i) => String(i)}
            stickyHeaderIndices={[0]}
            bounces={false}
          />
          {NoResult}
        </SafeAreaView>
      </ReactNativeModal>
    </>
  );
};

const styles = StyleSheet.create({
  modal: {
    height,
    backgroundColor: colors.lightGrey,
    justifyContent: "flex-start",
    margin: 0,
  },
  header: {
    height: 63,
    width: "100%",
    overflow: "hidden",
    paddingHorizontal: 14,
    paddingVertical: 9,
    flexDirection: "row",
    backgroundColor: colors.white,
  },
  searchBar: {
    flexGrow: 1,
    flexShrink: 1,
    flexDirection: "row",
    height: 44,
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: colors.lightGrey,
    borderRadius: 3,
    paddingRight: 44,
  },
  searchBarIcon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  searchBarInput: {
    flexGrow: 1,
    flexDirection: "row",
    height: 44,
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: colors.lightGrey,
    borderRadius: 3,
  },
  searchBarTextInput: {
    flex: 1,
    fontSize: 14,
    lineHeight: 17,
    color: colors.smoke,
  },
  cancelButton: {
    flexBasis: "auto",
    width: "auto",
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  cancelButtonText: {
    color: colors.smoke,
    fontSize: 14,
  },
  searchList: {
    flex: 1,
    width: "100%",
  },
  noResult: {
    position: "absolute",
    top: 54,
    left: 0,
    width: "100%",
    height: height / 2,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 0,
  },
  noResultIcon: {
    marginLeft: 25,
    marginVertical: 25,
  },
  noResultText: {
    fontSize: 17,
    lineHeight: 21,
    color: colors.darkBlue,
    marginBottom: 8,
  },
  noResultDesc: {
    fontSize: 14,
    lineHeight: 17,
    color: colors.grey,
  },
});
